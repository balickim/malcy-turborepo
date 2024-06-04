import { IChatMessageDto } from "~/api/chat/dtos";
import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";

export default class ChatApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/chat`;

  getMessagesInConversation = async (
    conversationId: number,
    page: number,
  ): Promise<IApiResponse<IChatMessageDto>> => {
    return fetchWrapper(`${this.basePath}/${conversationId}/${page}`);
  };
}
