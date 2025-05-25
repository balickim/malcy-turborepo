import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import { HabitableZonesTypesEnum } from "../../habitable-zones";
import { WorldsConfigEntity } from "../../worlds-config";
import { Max, Min } from "class-validator";
import { nanoid } from "nanoid";
import { AuditableBaseEntity } from "../../event-log";

@Entity({ name: "habitableZones" })
export class BackofficeHabitableZonesEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    type: "geometry",
    spatialFeatureType: "Polygon",
    srid: 4326,
  })
  area: string;

  @Column({
    type: "enum",
    enum: HabitableZonesTypesEnum,
    nullable: true,
    default: null,
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

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
