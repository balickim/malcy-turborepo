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
  deletedBy?: string;

  @Index()
  @Column({ select: false })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ select: false })
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ select: false })
  deletedAt?: Date;
}
