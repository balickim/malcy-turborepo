import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import {
  SettlementsEntity,
  SettlementTypesEnum,
} from '~/modules/settlements/entities/settlements.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';
import { UnitType } from 'shared-types';

// It is a snapshot of a settlement as user saw it walking by at that moment of time
@Entity('discoveredSettlements')
export class DiscoveredSettlementsEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discoveredByUserId: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  settlementId: string;

  @Column()
  type: SettlementTypesEnum;

  @Column({ nullable: true })
  [UnitType.SWORDSMAN]: number;

  @Column({ nullable: true })
  [UnitType.ARCHER]: number;

  @Column({ nullable: true })
  [UnitType.KNIGHT]: number;

  @Column({ nullable: true })
  [UnitType.LUCHADOR]: number;

  @Column({ nullable: true })
  [UnitType.ARCHMAGE]: number;

  @ManyToOne(() => UsersEntity, (user) => user.discoveredSettlements)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(
    () => SettlementsEntity,
    (settlement) => settlement.discoveredByUsers,
  )
  @JoinColumn({ name: 'settlementId' })
  settlement: SettlementsEntity;
}
