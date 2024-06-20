import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import {
  HabitableZonesEntity,
  HabitableZonesTypesEnum,
} from '~/modules/habitable-zones/entities/habitable-zones.entity';

// It is a snapshot of a habitable zone as user saw it walking by at that moment of time
@Entity('discoveredHabitableZones')
@Unique(['habitableZoneId', 'discoveredByUserId'])
export class DiscoveredHabitableZonesEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  habitableZoneId: string;

  @Column()
  discoveredByUserId: string;

  @Column({
    nullable: true,
    default: null,
  })
  type: HabitableZonesTypesEnum;

  @ManyToOne(
    () => HabitableZonesEntity,
    (habitableZone) => habitableZone.discoveredByUsers,
  )
  @JoinColumn({ name: 'habitableZoneId' })
  habitableZone: HabitableZonesEntity;
}
