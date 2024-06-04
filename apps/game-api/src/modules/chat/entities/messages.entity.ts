import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';

import { ConversationsEntity } from '~/modules/chat/entities/conversations.entity';
import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';

@Entity({ name: 'messages' })
export class MessagesEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Index('idx_messages_user')
  @ManyToOne(() => UsersEntity, (user) => user.sentMessages)
  user: UsersEntity;

  @Index('idx_messages_conversation')
  @ManyToOne(() => ConversationsEntity, (conversation) => conversation.messages)
  conversation: ConversationsEntity;
}
