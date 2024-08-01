import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IExpressRequestWithUser } from '~/modules/auth/guards/session.guard';
import { PushNotificationsService } from '~/modules/push-notifications/push-notifications.service';
import { ISessionUser } from '~/modules/users/dtos/users.dto';

@ApiTags('push-notifications')
@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  @Post('/update-token')
  async getUsersDiscoveredAreas(
    @Request() req: IExpressRequestWithUser<ISessionUser>,
    @Body() body: { token: string },
  ) {
    return this.pushNotificationsService.updateToken(req.user.id, body.token);
  }
}
