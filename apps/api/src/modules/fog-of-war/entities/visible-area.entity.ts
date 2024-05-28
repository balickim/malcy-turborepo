import { nanoid } from 'nanoid';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';

@Entity({ name: 'visibleArea' })
export class VisibleAreaEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  area: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
