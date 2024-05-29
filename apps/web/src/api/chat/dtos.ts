import { IJwtUser } from "~/types/user";

export interface IMessageDto {
  userId: number;
  content: string;
  conversationId: number;
  createdAt: Date;
  user: IJwtUser;
}

export interface IChatMessageDto {
  messages: IMessageDto[];
  nextPage: number | undefined;
}
