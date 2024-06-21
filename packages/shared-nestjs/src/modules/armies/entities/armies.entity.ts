import { nanoid } from "nanoid";
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";
import { UnitType } from "shared-types";
import { UsersEntity } from "../../users/entities/users.entity";
import { SettlementsEntity } from "../../settlements/entities/settlements.entity";

@Entity({ name: "armies" })
export class ArmyEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, default: 0 })
  [UnitType.SWORDSMAN]: number;

  @Column({ nullable: false, default: 0 })
  [UnitType.ARCHER]: number;

  @Column({ nullable: false, default: 0 })
  [UnitType.KNIGHT]: number;

  @Column({ nullable: false, default: 0 })
  [UnitType.LUCHADOR]: number;

  @Column({ nullable: false, default: 0 })
  [UnitType.ARCHMAGE]: number;

  @Column({ nullable: true, unique: true })
  userId?: string;

  @Column({ nullable: true, unique: true })
  settlementId?: string;

  @OneToOne(() => UsersEntity, (user) => user.army)
  @JoinColumn({ name: "userId" })
  user: UsersEntity;

  @OneToOne(() => SettlementsEntity, (settlement) => settlement.army)
  @JoinColumn({ name: "settlementId" })
  settlement: SettlementsEntity;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
