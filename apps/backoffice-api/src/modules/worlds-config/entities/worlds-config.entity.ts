import { AuditableBaseEntity } from 'shared-nestjs';
import { WorldConfig } from 'shared-types';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';

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
    () => HabitableZonesEntity,
    (habitableZone) => habitableZone.worldConfig,
  )
  habitableZones: HabitableZonesEntity[];
}
