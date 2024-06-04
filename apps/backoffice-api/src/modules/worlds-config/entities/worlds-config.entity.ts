import { GameConfig } from 'shared-types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';

@Entity({ name: 'worldsConfig' })
export class WorldsConfigEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'jsonb' })
  config: GameConfig;
}
