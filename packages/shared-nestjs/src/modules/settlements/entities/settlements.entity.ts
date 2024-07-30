import { Max, Min } from "class-validator";
import { nanoid } from "nanoid";
import {
  BeforeInsert,
  Column,
  Entity,
  GeoJSON,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";
import { UsersEntity } from "../../users/entities/users.entity";
import { ArmyEntity } from "../../armies/entities/armies.entity";
import { DiscoveredSettlementsEntity } from "../../fog-of-war/entities/discovered-settlements.entity";

export enum SettlementTypesEnum {
  MINING_TOWN = "MINING_TOWN",
  CASTLE_TOWN = "CASTLE_TOWN",
  FORTIFIED_SETTLEMENT = "FORTIFIED_SETTLEMENT",
  CAPITOL_SETTLEMENT = "CAPITOL_SETTLEMENT",
}

@Entity({ name: "settlements" })
export class SettlementsEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({
    type: "geometry",
    spatialFeatureType: "Point",
    srid: 4326,
  })
  location: GeoJSON;

  @Column({
    type: "enum",
    enum: SettlementTypesEnum,
    default: SettlementTypesEnum.MINING_TOWN,
  })
  type: SettlementTypesEnum;

  @Column({ type: "boolean", default: false })
  isBesieged: boolean;

  @Column({ select: false, default: 0 })
  @Min(0)
  gold: number;

  @Column({ select: false, default: 0 })
  @Min(0)
  wood: number;

  @Column({ select: false, default: 0 })
  @Min(0)
  iron: number;

  @Column({ default: 1, nullable: false })
  @Min(1)
  @Max(10)
  resourcesMultiplicator: number;

  @ManyToOne(() => UsersEntity, (user) => user.settlements)
  user: UsersEntity;

  @OneToOne(() => ArmyEntity, (army) => army.settlement)
  army: ArmyEntity;

  @OneToMany(() => DiscoveredSettlementsEntity, (ds) => ds.settlement)
  discoveredByUsers: DiscoveredSettlementsEntity[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
