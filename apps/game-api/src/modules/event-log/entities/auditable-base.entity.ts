import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AuditableBaseEntity {
  @Column({ select: false, default: 'system' })
  createdBy: string;

  @Column({ select: false, default: 'system' })
  updatedBy: string;

  @Column({ select: false, nullable: true })
  deletedBy: string;

  @Index()
  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
