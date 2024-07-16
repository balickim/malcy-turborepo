import { LoginUserDto, RegisterUserDto } from "shared-nestjs";

import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";
import { IUser } from "~/types/user";

export default class AuthApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/auth`;

  login = async (
    body: LoginUserDto,
    // TODO fix that: Getting session_id here is a workaround for mobile, where the credentials are not correctly added in the handshake object
  ): Promise<IApiResponse<{ session_id: string; user: IUser }>> => {
    return fetchWrapper(`${this.basePath}/login`, {
      body: JSON.stringify(body),
      method: "POST",
      credentials: "include",
    });
  };

  register = async (body: RegisterUserDto): Promise<IApiResponse<string>> => {
    return fetchWrapper(`${this.basePath}/register`, {
      body: JSON.stringify(body),
      method: "POST",
      credentials: "include",
    });
  };

  logout = async (): Promise<IApiResponse<string>> => {
    return fetchWrapper(`${this.basePath}/logout`, { credentials: "include" });
  };
}
