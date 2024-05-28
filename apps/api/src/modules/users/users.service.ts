import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { include } from '~/common/utils';
import { ConfigService } from '~/modules/config/config.service';
import { IJwtUser } from '~/modules/users/dtos/users.dto';
import { UsersEntity } from '~/modules/users/entities/users.entity';

export const userLastActionRedisKey = (id: string) => `user:last_action:${id}`;
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
    @InjectRedis() private readonly redis: Redis,
    private configService: ConfigService,
  ) {}

  findOneByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findOneWithPasswordByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  findOneById(id: string, relations?: string[]): Promise<UsersEntity | null> {
    return this.usersRepository.findOne({
      select: include(this.usersRepository, ['gold', 'wood']),
      where: { id },
      relations,
    });
  }

  async create(user: UsersEntity): Promise<UsersEntity> {
    this.logger.log(`SAVING USER ID ${user.id}`);
    let res;
    try {
      res = await this.usersRepository.save(user);
    } catch (e) {
      this.logger.error(`SAVING USER FAILED ${user.id}`);
    }
    this.logger.log(`USER SAVED ${user.id}`);

    return res;
  }

  public setActionTimestamp(user: IJwtUser | UsersEntity) {
    this.redis.set(userLastActionRedisKey(user.id), new Date().getTime());
  }

  public async getIsOnline(userId: string) {
    const TIME_SECONDS = this.configService.gameConfig.USER_IS_ONLINE_SECONDS;
    const userLastAction = await this.redis.get(userLastActionRedisKey(userId));
    if (!userLastAction) {
      return false;
    }

    const userLastActionTimestamp = parseInt(userLastAction);
    const currentTimestamp = new Date().getTime();
    const differenceInSeconds =
      (currentTimestamp - userLastActionTimestamp) / 1000;

    return differenceInSeconds < TIME_SECONDS;
  }
}
