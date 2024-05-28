import { UsersEntity } from '~/modules/users/entities/users.entity';

export type TBasicUser = Pick<UsersEntity, 'id' | 'username'>;
