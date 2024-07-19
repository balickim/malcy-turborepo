import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { ActionType, RegisterUserDto, UsersEntity } from 'shared-nestjs';

import { EventLogService } from '~/modules/event-log/event-log.service';
import { UsersService } from '~/modules/users/users.service';

const userSessionKey = (userId: string) => `user:${userId}:session`;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    @InjectRedis() private readonly redis: Redis,
    private eventLogService: EventLogService,
  ) {}

  async validateUser(email: string, password: string): Promise<UsersEntity> {
    const user = await this.usersService.findOneWithPasswordByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return user;
  }

  async createSession(user: UsersEntity): Promise<string> {
    const sessionId = `session_${user.id}_${new Date().getTime()}`;
    const sessionData = JSON.stringify({
      sessionId,
      userId: user.id,
      username: user.username,
    });
    await this.redis.set(
      userSessionKey(user.id),
      sessionData,
      'EX',
      31 * 24 * 60 * 60,
    ); // 31 days expiry
    return sessionId;
  }

  async invalidateSession(userId: string) {
    await this.redis.del(userSessionKey(userId));
  }

  async getUserFromSession(
    sessionId: string,
  ): Promise<{ userId: string; username: string } | null> {
    const keys = await this.redis.keys('user:*:session');
    for (const key of keys) {
      const sessionData = await this.redis.get(key);
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        if (parsedData.sessionId === sessionId) {
          return { userId: parsedData.userId, username: parsedData.username };
        }
      }
    }
    return null;
  }

  async validateSession(sessionId: string, userId: string): Promise<boolean> {
    const sessionData = await this.redis.get(userSessionKey(userId));
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      return parsedData.sessionId === sessionId;
    }
    return false;
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<string> {
    this.logger.log(`REGISTERING USER EMAIL ${registerUserDto.email}`);
    const existingUser = await this.usersService.findOne(
      registerUserDto.email,
      registerUserDto.username,
    );
    if (existingUser && existingUser.username === registerUserDto.username) {
      throw new BadRequestException('username already exists');
    }
    if (existingUser && existingUser.email === registerUserDto.email) {
      throw new BadRequestException('email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const newUser = new UsersEntity();
    newUser.username = registerUserDto.username;
    newUser.email = registerUserDto.email;
    newUser.password = hashedPassword;

    await this.usersService.create(newUser);

    this.logger.log(`USER REGISTERED id: ${newUser.id}`);
    this.eventLogService
      .logEvent({
        actionType: ActionType.userRegistered,
        actionByUserId: newUser.id,
      })
      .catch((error) => this.logger.error(`FAILED TO LOG EVENT --${error}--`));
    return 'success';
  }
}
