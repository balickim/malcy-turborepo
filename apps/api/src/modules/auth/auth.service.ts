import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterRequestDto } from '~/modules/auth/dtos/register-request.dto';
import { Tokens } from '~/modules/auth/types/Tokens';
import { ConfigService } from '~/modules/config/config.service';
import { ActionType } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { UsersEntity } from '~/modules/users/entities/users.entity';
import { UsersService } from '~/modules/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  private async generateToken(user: UsersEntity): Promise<Tokens> {
    const payload = { id: user.id, email: user.email, username: user.username };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.appConfig.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.appConfig.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(user: UsersEntity): Promise<Tokens> {
    return this.generateToken(user);
  }

  async register(user: RegisterRequestDto): Promise<Tokens> {
    this.logger.log(`REGISTERING USER EMAIL ${user.email}`);

    const existingUser = await this.usersService.findOneByEmail(user.email);
    if (existingUser) {
      this.logger.error(`EMAIL ALREADE EXISTS USER EMAIL ${user.email}`);
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new UsersEntity();
    newUser.username = user.username;
    newUser.email = user.email;
    newUser.password = hashedPassword;
    await this.usersService.create(newUser);
    this.logger.log(`USER REGISTERED id: ${newUser.id}`);
    this.eventLogService
      .logEvent({
        actionType: ActionType.userRegistered,
        actionByUserId: newUser.id,
      })
      .catch((error) => this.logger.error(`FAILED TO LOG EVENT --${error}--`));
    return this.login(newUser);
  }

  async refreshToken(user: UsersEntity): Promise<Tokens> {
    this.logger.log(`REFRESHING TOKEN USER ID ${user.id}`);
    return this.generateToken(user);
  }

  async validateUserById(id: string) {
    return this.usersService.findOneById(id);
  }

  verifyRefreshToken(refreshToken: string): any {
    try {
      return this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
