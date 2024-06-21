import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";
import { GroupsMembersEntity } from "./groups-members.entity";

@Entity({ name: "groups" })
export class GroupsEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => GroupsMembersEntity, (groupMember) => groupMember.group)
  members: GroupsMembersEntity[];
}
