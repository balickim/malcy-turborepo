import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api-key') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
