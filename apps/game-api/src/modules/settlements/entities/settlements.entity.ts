import { Max, Min } from 'class-validator';
import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  GeoJSON,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';

export enum SettlementTypesEnum {
  MINING_TOWN = 'MINING_TOWN',
  CASTLE_TOWN = 'CASTLE_TOWN',
  FORTIFIED_SETTLEMENT = 'FORTIFIED_SETTLEMENT',
  CAPITOL_SETTLEMENT = 'CAPITOL_SETTLEMENT',
}

export const enum ResourceTypeEnum {
  wood = 'wood',
  gold = 'gold',
}

@Entity({ name: 'settlements' })
// resource values must be also changes in game.config.ts because this is evaluated before config
@Check(`
  "gold" >= 0 AND "gold" <= CASE
    WHEN "type" = '${SettlementTypesEnum.MINING_TOWN}' THEN 4000
    WHEN "type" = '${SettlementTypesEnum.CASTLE_TOWN}' THEN 8000
    WHEN "type" = '${SettlementTypesEnum.FORTIFIED_SETTLEMENT}' THEN 16000
    WHEN "type" = '${SettlementTypesEnum.CAPITOL_SETTLEMENT}' THEN 100000
    ELSE 4000
  END
`)
@Check(`
  "wood" >= 0 AND "wood" <= CASE
    WHEN "type" = '${SettlementTypesEnum.MINING_TOWN}' THEN 1000
    WHEN "type" = '${SettlementTypesEnum.CASTLE_TOWN}' THEN 2000
    WHEN "type" = '${SettlementTypesEnum.FORTIFIED_SETTLEMENT}' THEN 4000
    WHEN "type" = '${SettlementTypesEnum.CAPITOL_SETTLEMENT}' THEN 80000
    ELSE 1000
  END
`)
export class SettlementsEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: GeoJSON;

  @Column({
    type: 'enum',
    enum: SettlementTypesEnum,
    default: SettlementTypesEnum.MINING_TOWN,
  })
  type: SettlementTypesEnum;

  @Column({ select: false, default: 0 })
  @Min(0)
  gold: number;

  @Column({ select: false, default: 0 })
  @Min(0)
  wood: number;

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
