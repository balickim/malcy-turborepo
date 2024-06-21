import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";
import { UsersEntity } from "../../users/entities/users.entity";
import { ConversationsEntity } from "./conversations.entity";

@Entity({ name: "messages" })
export class MessagesEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  content: string;

  @Index("idx_messages_user")
  @ManyToOne(() => UsersEntity, (user) => user.sentMessages)
  user: UsersEntity;

  @Index("idx_messages_conversation")
  @ManyToOne(() => ConversationsEntity, (conversation) => conversation.messages)
  conversation: ConversationsEntity;
}
