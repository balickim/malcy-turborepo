import { TArmy } from "~/types/army";

export interface IUser {
  createdAt: Date;
  deletedAt: Date | null;
  email: string;
  id: string;
  nick: string;
  wood?: number;
  gold?: number;
  updatedAt: Date;
  army: TArmy;
}

export interface IJwtUser {
  id: string;
  username: string;
  iat: number;
  exp: number;
}
