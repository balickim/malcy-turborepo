import { UsersEntity } from 'shared-nestjs';

export type TBasicUser = Pick<UsersEntity, 'id' | 'username'>;
