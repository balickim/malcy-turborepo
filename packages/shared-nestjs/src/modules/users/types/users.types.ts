import { UsersEntity } from "src/index";

export type TBasicUser = Pick<UsersEntity, "id" | "username">;
