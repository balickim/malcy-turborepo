import { IsEmail, IsOptional, Max, Min } from "class-validator";
import { nanoid } from "nanoid";
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { SettlementsEntity } from "../../settlements/entities/settlements.entity";
import { ArmyEntity } from "../../armies/entities/armies.entity";
import { MessagesEntity } from "../../chat/entities/messages.entity";
import { GroupsMembersEntity } from "../../chat/entities/groups-members.entity";
import { DiscoveredSettlementsEntity } from "../../fog-of-war/entities/discovered-settlements.entity";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";

@Entity({ name: "users" })
@Check(`"gold" >= 0 AND "gold" <= 100000`)
@Check(`"wood" >= 0 AND "wood" <= 80000`)
export class UsersEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @IsOptional()
  @Column({ unique: true, nullable: false })
  username: string;

  @IsEmail()
  @Column({ select: false, unique: true, nullable: false })
  email: string;

  @Column({ select: false, nullable: false })
  password: string;

  @Column({ select: false, default: 0 })
  @Min(0)
  @Max(100_000)
  gold: number;

  @Column({ select: false, default: 0 })
  @Min(0)
  @Max(80_000)
  wood: number;

  @Column({ select: false, default: 0 })
  @Min(0)
  @Max(80_000)
  iron: number;

  @OneToMany(() => SettlementsEntity, (settlement) => settlement.user)
  settlements: SettlementsEntity[];

  @OneToOne(() => ArmyEntity, (army) => army.user)
  army: ArmyEntity;

  @OneToMany(() => MessagesEntity, (message) => message.user)
  sentMessages: MessagesEntity[];

  @OneToMany(() => GroupsMembersEntity, (groupMember) => groupMember.user)
  groups: GroupsMembersEntity[];

  @OneToMany(() => DiscoveredSettlementsEntity, (ds) => ds.user)
  discoveredSettlements: DiscoveredSettlementsEntity[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
