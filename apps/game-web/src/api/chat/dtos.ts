import { ISessionUser } from "~/types/user";

export interface IMessageDto {
  userId: number;
  content: string;
  conversationId: number;
  createdAt: Date;
  user: ISessionUser;
}

export interface IChatMessageDto {
  messages: IMessageDto[];
  nextPage: number | undefined;
}
