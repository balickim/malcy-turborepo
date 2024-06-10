import { WorldConfig } from 'shared-types';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { HabitableZonesEntity } from '~/modules/habitable-zones/entities/habitable-zones.entity';

@Entity({ name: 'worldsConfig' })
export class WorldsConfigEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'jsonb' })
  config: WorldConfig;

  @OneToMany(
    () => HabitableZonesEntity,
    (habitableZone) => habitableZone.worldConfig,
  )
  habitableZones: HabitableZonesEntity[];
}
