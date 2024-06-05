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
import { UnitType } from 'shared-types';
import { Repository } from 'typeorm';

import { sleep } from '~/common/utils';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigService } from '~/modules/config/config.service';
import {
  RequestRecruitmentDto,
  ResponseRecruitmentDto,
} from '~/modules/recruitments/dtos/recruitments.dto';
import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';
import { ResourceTypeEnum } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

const bullSettlementRecruitmentQueueName = (settlementId: string) =>
  `recruitment:settlement_${settlementId}`;
const settlementRecruitmentProgressKey = (
  settlementId: string,
  unitType: UnitType,
  jobId: number | string,
) => `recruitmentProgress:${settlementId}:${unitType}:${jobId}`;

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
        new Queue<ResponseRecruitmentDto>(queueName, {
          connection: this.redis,
        });
        new Worker(queueName, this.recruitProcessor, {
          connection: this.redis,
        });
      }),
    );
  }

  public async startRecruitment(
    recruitDto: RequestRecruitmentDto,
    settlement: PrivateSettlementDto,
  ) {
    const gameConfig = await this.configService.gameConfig();

    const unitRecruitmentTime =
      gameConfig.SETTLEMENT[settlement.type].RECRUITMENT[recruitDto.unitType]
        .TIME_MS ?? undefined;

    if (unitRecruitmentTime === undefined) {
      throw new BadRequestException(
        `Unit type ${recruitDto.unitType} cannot be recruited in this settlement type.`,
      );
    }

    const unitCost =
      gameConfig.SETTLEMENT[settlement.type].RECRUITMENT[recruitDto.unitType]
        .COST ?? undefined;
    const goldCost = unitCost[ResourceTypeEnum.gold] * recruitDto.unitCount;
    const woodCost = unitCost[ResourceTypeEnum.wood] * recruitDto.unitCount;

    if (settlement.gold < goldCost || settlement.wood < woodCost) {
      throw new BadRequestException('You dont have enough resources');
    }

    const unfinishedJobs = await this.getUnfinishedRecruitmentsBySettlementId(
      recruitDto.settlementId,
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
    };
    const finishesOn = new Date(
      Date.now() + recruitDto.unitCount * unitRecruitmentTime + totalDelayMs,
    );
    const data: ResponseRecruitmentDto = {
      ...recruitDto,
      unitRecruitmentTime,
      finishesOn,
      lockedResources,
    };

    await this.settlementsService.changeResources(
      recruitDto.settlementId,
      lockedResources,
    );

    const queue = new Queue<ResponseRecruitmentDto>(
      bullSettlementRecruitmentQueueName(recruitDto.settlementId),
      { connection: this.redis },
    );
    new Worker(
      bullSettlementRecruitmentQueueName(recruitDto.settlementId),
      this.recruitProcessor,
      { connection: this.redis },
    );
    const job: Job<ResponseRecruitmentDto> = await queue.add('recruit', data, {
      delay: totalDelayMs,
    });
    this.logger.log(
      `Job added to queue for settlement ${recruitDto.settlementId} with ID: ${job.id}`,
    );
    return job;
  }

  public async cancelRecruitment(
    settlementId: string,
    jobId: string,
    user: IJwtUser,
  ) {
    const settlement =
      await this.settlementsService.getPublicSettlementById(settlementId);
    if (settlement.user.id !== user.id) throw new UnauthorizedException();

    const queue = new Queue<ResponseRecruitmentDto>(
      bullSettlementRecruitmentQueueName(settlementId),
      { connection: this.redis },
    );
    const job: Job<ResponseRecruitmentDto> = await queue.getJob(jobId);
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

      await this.settlementsService.changeResources(settlementId, {
        [ResourceTypeEnum.gold]:
          goldPerUnit * (job.data.unitCount - Number(job.progress)),
        [ResourceTypeEnum.wood]:
          woodPerUnit * (job.data.unitCount - Number(job.progress)),
      });
    }

    return 'success';
  }

  public async getUnfinishedRecruitmentsBySettlementId(settlementId: string) {
    const queue = new Queue<ResponseRecruitmentDto>(
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

  private recruitProcessor = async (job: Job<ResponseRecruitmentDto>) => {
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
    recruitDto: RequestRecruitmentDto,
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

    army[recruitDto.unitType] += 1;
    await this.armyRepository.save(army);

    await this.saveRecruitmentProgress(recruitDto, jobId, currentProgress + 1);
    return true;
  }

  private async saveRecruitmentProgress(
    recruitDto: RequestRecruitmentDto,
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
    recruitDto: RequestRecruitmentDto,
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
