import { WorldConfig } from 'shared-types';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableBaseEntity } from "../../event-log";
import { BackofficeHabitableZonesEntity } from "../../backoffice-habitable-zones";

@Entity({ name: 'worldsConfig' })
export class WorldsConfigEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  baseUrl: string;

  @Column({ type: 'jsonb' })
  config: WorldConfig;

  @OneToMany(
    () => BackofficeHabitableZonesEntity,
    (habitableZone) => habitableZone.worldConfig,
  )
  habitableZones: BackofficeHabitableZonesEntity[];
}
