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
import { UsersEntity } from "../../users/entities/users.entity";
import { SettlementsEntity } from "../../settlements/entities/settlements.entity";

@Entity({ name: "sieges" })
export class SiegesEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true, unique: true })
  attackerUserId?: string;

  @Column({ nullable: true, unique: true })
  settlementId?: string;

  @OneToOne(() => UsersEntity, (user) => user.army)
  @JoinColumn({ name: "attackerUserId" })
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
