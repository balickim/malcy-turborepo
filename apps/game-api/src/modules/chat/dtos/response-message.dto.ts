import { RequestMessageDto } from '~/modules/chat/dtos/request-message.dto';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

export class ResponseMessageDto extends RequestMessageDto {
  createdAt: Date;
  user: IJwtUser;
}
