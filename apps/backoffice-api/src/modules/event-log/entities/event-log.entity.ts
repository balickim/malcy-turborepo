import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ActionType {
  securityIncident = 'SECURITY_INCIDENT',
  userRegistered = 'USER_REGISTERED',
  settlementCreated = 'SETTLEMENT_CREATED',
}

export enum TableName {
  users = 'users',
  settlements = 'settlements',
  armies = 'armies',
}

@Entity({ name: 'eventLog' })
export class EventLogEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  @Index('idx_eventLog_actionType')
  actionType: ActionType;

  @Column({
    type: 'enum',
    enum: TableName,
    nullable: true,
  })
  tableName?: TableName;

  @Column({ type: 'varchar', nullable: true })
  recordId?: string;

  @Column({ type: 'json', nullable: true })
  changedData?: object;

  @Column({ type: 'json', nullable: true })
  previousData?: object;

  @Column()
  @CreateDateColumn()
  actionDate: Date;

  @Column({ type: 'varchar', nullable: true })
  actionByUserId?: string;

  @Column({ type: 'varchar', length: 39, nullable: true })
  userIp?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
