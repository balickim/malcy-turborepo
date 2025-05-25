import { Max, Min } from "class-validator";
import { nanoid } from "nanoid";
import {
  BeforeInsert,
  Column,
  Entity, ManyToOne,
  OneToMany,
  PrimaryColumn
} from "typeorm";
import { DiscoveredHabitableZonesEntity, HabitableZonesEntity, HabitableZonesTypesEnum } from "../../habitable-zones";
import { WorldsConfigEntity } from "../../worlds-config";

@Entity({ name: "habitableZones" })
export class BackofficeHabitableZonesEntity extends HabitableZonesEntity {
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

  @OneToMany(() => DiscoveredHabitableZonesEntity, (ds) => ds.habitableZone)
  discoveredByUsers: DiscoveredHabitableZonesEntity[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
