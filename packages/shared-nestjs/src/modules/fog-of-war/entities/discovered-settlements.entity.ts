import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";

import { UnitType } from "shared-types";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";
import {
  SettlementTypesEnum,
  SettlementsEntity,
} from "../../settlements/entities/settlements.entity";
import { UsersEntity } from "../../users/entities/users.entity";

// It is a snapshot of a settlement as user saw it walking by at that moment of time
@Entity("discoveredSettlements")
@Unique(["settlementId", "discoveredByUserId"])
export class DiscoveredSettlementsEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discoveredByUserId: string;

  @Column()
  userId: string;

  @Column()
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
  @JoinColumn({ name: "userId" })
  user: UsersEntity;

  @ManyToOne(
    () => SettlementsEntity,
    (settlement) => settlement.discoveredByUsers
  )
  @JoinColumn({ name: "settlementId" })
  settlement: SettlementsEntity;
}
