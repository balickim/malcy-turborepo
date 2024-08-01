import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import {
  ArmyEntity,
  ResponseStartRecruitmentDto,
  StartRecruitmentDto,
} from 'shared-nestjs';
import { ResourceTypeEnum, UnitType } from 'shared-types';
import { Repository } from 'typeorm';

import { sleep } from '~/common/utils';
import { ConfigService } from '~/modules/config/config.service';
import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

const bullSettlementRecruitmentQueueName = (settlementId: string) =>
  `recruitment:settlement_${settlementId}`;
const settlementRecruitmentProgressKey = (
  settlementId: string,
  unitType: UnitType,
  jobId: number | string,
) => `recruitment_progress:${settlementId}:${unitType}:${jobId}`;

@Injectable()
export class RecruitmentsService implements OnModuleInit {
  private readonly logger = new Logger(RecruitmentsService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRepository(ArmyEntity)
    private armyRepository: Repository<ArmyEntity>,
    @Inject(forwardRef(() => SettlementsService))
    private settlementsService: SettlementsService,
    private configService: ConfigService,
  ) {}

  // Assigns processors to all active or waiting jobs after server restart
  // bull does not keep processors code in between restarts
  async onModuleInit() {
    const prefix = 'bull:recruitment:';
    const queueNames = new Set<string>();
    let cursor = '0';

    do {
      const reply = await this.redis.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        '1000',
      );
      cursor = reply[0];
      reply[1].forEach((key: string) => {
        const match = key.match(/^(bull:recruitment:[^:]+)(?::[^:]+)?$/);
        if (match && match[1]) {
          queueNames.add(match[1].replace('bull:', ''));
        }
      });
    } while (cursor !== '0');

    this.logger.log(
      `Attaching processors to ${[...queueNames].length} existing recruitment queues...`,
    );
    await Promise.all(
      [...queueNames].map((queueName) => {
        new Queue<ResponseStartRecruitmentDto>(queueName, {
          connection: this.redis,
        });
        new Worker(queueName, this.recruitProcessor, {
          connection: this.redis,
        });
      }),
    );
  }

  public async startRecruitment(
    startRecruitmentDto: StartRecruitmentDto,
    settlement: PrivateSettlementDto,
  ) {
    const gameConfig = await this.configService.gameConfig();

    const unitRecruitmentTime =
      gameConfig.SETTLEMENT[settlement.type].RECRUITMENT[
        startRecruitmentDto.unitType
      ].TIME_MS ?? undefined;

    if (unitRecruitmentTime === undefined) {
      throw new BadRequestException(
        `Unit type ${startRecruitmentDto.unitType} cannot be recruited in this settlement type.`,
      );
    }

    const unitCost =
      gameConfig.SETTLEMENT[settlement.type].RECRUITMENT[
        startRecruitmentDto.unitType
      ].COST ?? undefined;
    const goldCost =
      unitCost[ResourceTypeEnum.gold] * startRecruitmentDto.unitCount;
    const woodCost =
      unitCost[ResourceTypeEnum.wood] * startRecruitmentDto.unitCount;
    const ironCost =
      unitCost[ResourceTypeEnum.iron] * startRecruitmentDto.unitCount;

    if (settlement.gold < goldCost || settlement.wood < woodCost) {
      throw new BadRequestException('You dont have enough resources');
    }

    const unfinishedJobs = await this.getUnfinishedRecruitmentsBySettlementId(
      startRecruitmentDto.settlementId,
    );
    let totalDelayMs = 0;
    for (const job of unfinishedJobs) {
      const jobFinishTime = new Date(job.data.finishesOn).getTime();
      const now = Date.now();
      if (jobFinishTime > now) {
        totalDelayMs += jobFinishTime - now;
      }
    }

    const lockedResources = {
      [ResourceTypeEnum.gold]: Math.max(-goldCost),
      [ResourceTypeEnum.wood]: Math.max(-woodCost),
      [ResourceTypeEnum.iron]: Math.max(-ironCost),
    };
    const finishesOn = new Date(
      Date.now() +
        startRecruitmentDto.unitCount * unitRecruitmentTime +
        totalDelayMs,
    );
    const data: ResponseStartRecruitmentDto = {
      ...startRecruitmentDto,
      unitRecruitmentTime,
      finishesOn,
      lockedResources,
    };

    await this.settlementsService.changeResources(
      startRecruitmentDto.settlementId,
      lockedResources,
    );

    const queue = new Queue<ResponseStartRecruitmentDto>(
      bullSettlementRecruitmentQueueName(startRecruitmentDto.settlementId),
      { connection: this.redis },
    );
    new Worker(
      bullSettlementRecruitmentQueueName(startRecruitmentDto.settlementId),
      this.recruitProcessor,
      { connection: this.redis },
    );
    const job: Job<ResponseStartRecruitmentDto> = await queue.add(
      'recruit',
      data,
      {
        delay: totalDelayMs,
      },
    );
    this.logger.log(
      `Job added to queue for settlement ${startRecruitmentDto.settlementId} with ID: ${job.id}`,
    );
    return job;
  }

  public async cancelRecruitment(settlementId: string, jobId: string) {
    const queue = new Queue<ResponseStartRecruitmentDto>(
      bullSettlementRecruitmentQueueName(settlementId),
      { connection: this.redis },
    );
    const job: Job<ResponseStartRecruitmentDto> = await queue.getJob(jobId);
    const recruitmentProgress = await this.getRecruitmentProgress(
      job.data,
      job.id,
    );
    if (recruitmentProgress < job.data.unitCount) {
      await this.saveRecruitmentProgress(job.data, jobId, job.data.unitCount); // save recruitment progress as it's goal to be sure it will not recruit more

      const goldPerUnit =
        Math.abs(job.data.lockedResources[ResourceTypeEnum.gold]) /
        job.data.unitCount;
      const woodPerUnit =
        Math.abs(job.data.lockedResources[ResourceTypeEnum.wood]) /
        job.data.unitCount;
      const ironPerUnit =
        Math.abs(job.data.lockedResources[ResourceTypeEnum.iron]) /
        job.data.unitCount;

      await this.settlementsService.changeResources(settlementId, {
        [ResourceTypeEnum.gold]:
          goldPerUnit * (job.data.unitCount - Number(job.progress)),
        [ResourceTypeEnum.wood]:
          woodPerUnit * (job.data.unitCount - Number(job.progress)),
        [ResourceTypeEnum.iron]:
          ironPerUnit * (job.data.unitCount - Number(job.progress)),
      });
    }

    return 'success';
  }

  public async getUnfinishedRecruitmentsBySettlementId(settlementId: string) {
    const queue = new Queue<ResponseStartRecruitmentDto>(
      bullSettlementRecruitmentQueueName(settlementId),
      { connection: this.redis },
    );
    let jobs = await queue.getJobs(['active', 'waiting', 'delayed']);

    const results = await Promise.all(
      jobs.map(async (job) => {
        const progress = await this.getRecruitmentProgress(job.data, job.id);
        return progress >= job.data.unitCount || progress === null;
      }),
    );
    jobs = jobs.filter((_, index) => !results[index]);
    if (!jobs) {
      return [];
    }

    return jobs;
  }

  private recruitProcessor = async (job: Job<ResponseStartRecruitmentDto>) => {
    const totalUnits = job.data.unitCount;
    const jobId = job.id;
    const unitRecruitTimeMs = job.data.unitRecruitmentTime;
    let leftoverTime = 0;

    for (let i = 0; i < totalUnits; i++) {
      const currentProgress = await this.getRecruitmentProgress(
        job.data,
        jobId,
      );
      if (currentProgress < totalUnits) {
        const sleepTime = Math.max(0, unitRecruitTimeMs - leftoverTime);
        await sleep(sleepTime);

        const start = Date.now();
        await this.recruitUnit(job.data, jobId);
        const duration = Date.now() - start;

        leftoverTime = duration - unitRecruitTimeMs;
        leftoverTime = Math.max(0, leftoverTime);

        await job.updateProgress(i + 1);
      } else {
        break;
      }
    }
    return '';
  };

  private async recruitUnit(
    recruitDto: StartRecruitmentDto,
    jobId: string,
  ): Promise<boolean> {
    const currentProgress = await this.getRecruitmentProgress(
      recruitDto,
      jobId,
    );

    if (currentProgress >= recruitDto.unitCount) {
      return false;
    }

    const army = await this.armyRepository.findOne({
      where: { settlementId: recruitDto.settlementId },
    });

    if (!army) {
      throw new Error('Army not found for the given settlement.');
    }

    army[recruitDto.unitType.toLowerCase()] += 1;
    await this.armyRepository.save(army);

    await this.saveRecruitmentProgress(recruitDto, jobId, currentProgress + 1);
    return true;
  }

  private async saveRecruitmentProgress(
    recruitDto: StartRecruitmentDto,
    jobId: number | string,
    progress: number,
  ): Promise<void> {
    const key = settlementRecruitmentProgressKey(
      recruitDto.settlementId,
      recruitDto.unitType,
      jobId,
    );
    await this.redis.set(key, progress.toString(), 'EX', 60 * 60 * 24 * 7); // Expire after a week
  }

  private async getRecruitmentProgress(
    recruitDto: StartRecruitmentDto,
    jobId: number | string,
  ): Promise<number> {
    const key = settlementRecruitmentProgressKey(
      recruitDto.settlementId,
      recruitDto.unitType,
      jobId,
    );
    const progress = await this.redis.get(key);
    return progress ? parseInt(progress, 10) : 0;
  }
}
