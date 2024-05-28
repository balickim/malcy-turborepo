import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((response) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        const message =
          this.reflector.get<string>(
            'response_message',
            context.getHandler(),
          ) || '';

        const baseResponse = { statusCode, message };

        if (
          typeof response === 'object' &&
          response !== null &&
          'meta' in response
        ) {
          return { ...baseResponse, data: response.data, meta: response.meta };
        } else {
          return { ...baseResponse, data: response };
        }
      }),
    );
  }
}
