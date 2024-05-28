import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';

@Entity({ name: 'conversations' })
export class ConversationsEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => MessagesEntity, (message) => message.conversation)
  messages: MessagesEntity[];
}
