import { toast } from "react-hot-toast";

import { userStore } from "~/store/userStore";
import { IApiResponse } from "~/types/common";
import { getAccessToken, setAccessToken } from "~/utils/cookies";

export async function tryRefreshToken() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  const res: IApiResponse<{ access_token: string }> = await response.json();
  if (res.data.access_token) return res.data.access_token;
  return false;
}

interface IFetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export async function fetchWrapper<T>(
  url: string,
  options?: IFetchOptions,
): Promise<T> {
  try {
    const headers = new Headers(options?.headers ?? {});
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response = await fetch(url, {
      ...options,
      headers: headers,
    });

    if (response.ok) {
      return response.json() as Promise<T>;
    } else if (response.status === 401) {
      const accessToken = await tryRefreshToken();
      if (accessToken) {
        setAccessToken(accessToken);
        headers.set("Authorization", `Bearer ${accessToken}`);
        response = await fetch(url, {
          ...options,
          headers: headers,
        });

        if (response.ok) {
          return response.json() as Promise<T>;
        }
      } else {
        userStore.logOut();
        const event = new CustomEvent("unauthorized");
        window.dispatchEvent(event);
      }
    }

    if (response.status === 500) throw new Error("500, internal server error");
    const res = await response.json();
    throw new Error(
      res.message ? res.message : `HTTP error! status: ${response.status}`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }
    throw error;
  }
}
