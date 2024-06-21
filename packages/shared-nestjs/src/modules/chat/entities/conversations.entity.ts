import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AuditableBaseEntity } from "../../event-log/entities/auditable-base.entity";
import { MessagesEntity } from "./messages.entity";

@Entity({ name: "conversations" })
export class ConversationsEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => MessagesEntity, (message) => message.conversation)
  messages: MessagesEntity[];
}
