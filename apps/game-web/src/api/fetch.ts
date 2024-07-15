import { toast } from "react-hot-toast";

import { userStore } from "~/store/userStore";

interface IFetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export async function fetchWrapper<T>(
  url: string,
  options?: IFetchOptions,
): Promise<T> {
  try {
    const headers = new Headers(options?.headers ?? {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: headers,
    });

    if (response.ok) {
      return response.json() as Promise<T>;
    } else if (response.status === 401) {
      userStore.logOut();
      const event = new CustomEvent("unauthorized");
      window.dispatchEvent(event);
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
