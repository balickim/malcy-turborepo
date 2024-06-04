import Cookies from "js-cookie";

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token");
}

export function setAccessToken(token: string): string | undefined {
  return Cookies.set("access_token", token);
}

export function removeAccessToken(): void {
  return Cookies.remove("access_token");
}
