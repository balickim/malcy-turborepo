import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";
import { UsersEntity } from "../../users/entities/users.entity";
import { GroupsEntity } from "./groups.entity";

@Entity({ name: "groupsMembers" })
export class GroupsMembersEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity, (user) => user.groups)
  user: UsersEntity;

  @ManyToOne(() => GroupsEntity, (group) => group.members)
  group: GroupsEntity;
}
