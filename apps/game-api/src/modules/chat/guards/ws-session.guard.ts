import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as cookie from 'cookie';
import Redis from 'ioredis';

@Injectable()
export class WsSessionGuard implements CanActivate {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();

    // Handle client.handshake?.headers?.cookie being different format from client.handshake.auth.cookie
    let sessionId: string;
    if (client.handshake?.headers?.cookie) {
      sessionId = cookie.parse(client.handshake.headers.cookie)['session_id'];
    } else if (client.handshake?.auth?.cookie) {
      sessionId = client.handshake.auth.cookie;
    }

    if (!sessionId) {
      return false;
    }

    try {
      const user = await this.getUserFromSession(sessionId);
      if (!user) {
        return false;
      }

      client.user = { id: user.userId, username: user.username }; // Attach the user information to the client object
      return true;
    } catch (error) {
      return false;
    }
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
}
