import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { GroupsEntity } from '~/modules/chat/entities/groups.entity';
import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';

@Entity({ name: 'groupsMembers' })
export class GroupsMembersEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity, (user) => user.groups)
  user: UsersEntity;

  @ManyToOne(() => GroupsEntity, (group) => group.members)
  group: GroupsEntity;
}
