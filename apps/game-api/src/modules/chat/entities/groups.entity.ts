import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { GroupsMembersEntity } from '~/modules/chat/entities/groups-members.entity';
import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';

@Entity({ name: 'groups' })
export class GroupsEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => GroupsMembersEntity, (groupMember) => groupMember.group)
  members: GroupsMembersEntity[];
}
