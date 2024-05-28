import { IsEmail, IsOptional, Max, Min } from 'class-validator';
import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { GroupsMembersEntity } from '~/modules/chat/entities/groups-members.entity';
import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';

@Entity({ name: 'users' })
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
