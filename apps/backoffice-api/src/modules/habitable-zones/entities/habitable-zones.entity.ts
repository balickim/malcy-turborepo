import { Max, Min } from 'class-validator';
import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { WorldsConfigEntity } from '~/modules/worlds-config/entities/worlds-config.entity';

export enum HabitableZonesTypesEnum {
  GOLD = 'GOLD',
  WOOD = 'WOOD',
  IRON = 'IRON',
}

@Entity({ name: 'habitableZones' })
export class HabitableZonesEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  area: GeoJSON.Polygon;

  @Column({
    type: 'enum',
    enum: HabitableZonesTypesEnum,
  })
  type: HabitableZonesTypesEnum;

  @Column({ default: 1, nullable: false })
  @Min(1)
  @Max(10)
  resourcesMultiplicator: number;

  @ManyToOne(
    () => WorldsConfigEntity,
    (worldConfig) => worldConfig.habitableZones,
  )
  worldConfig: WorldsConfigEntity;

  @Column()
  worldConfigId: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
