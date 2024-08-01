import { IChatMessageDto } from "~/api/chat/dtos";
import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";

export default class PushNotificationsApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/push-notifications`;

  updateToken = async (
    token: string,
  ): Promise<IApiResponse<IChatMessageDto>> => {
    return fetchWrapper(`${this.basePath}/update-token`, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  };
}
