import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";
import { IUser } from "~/types/user";

export default class UsersApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/users`;

  getMe = async (): Promise<IApiResponse<IUser>> => {
    return fetchWrapper(`${this.basePath}/me`);
  };
}
