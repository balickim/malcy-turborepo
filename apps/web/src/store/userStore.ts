import { makeAutoObservable } from "mobx";
import {
  makePersistable,
  isPersisting,
  stopPersisting,
} from "mobx-persist-store";

import { IUser } from "~/types/user";
import { removeAccessToken, setAccessToken } from "~/utils/cookies";

const userReset = (): IUser => {
  return {
    id: "",
    email: "",
    nick: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    army: { swordsman: 0, archer: 0, knight: 0, luchador: 0, archmage: 0 },
  };
};

class UserStore {
  user: IUser = userReset();
  isLoggedIn = false;

  constructor() {
    makeAutoObservable(this);
    const storageName = "UserStore";
    if (isPersisting(this)) {
      stopPersisting(this);
    }
    makePersistable(this, {
      name: storageName,
      properties: ["user", "isLoggedIn"],
      storage: window.localStorage,
    });
  }

  logIn(userData: { access_token: string; user: IUser }) {
    setAccessToken(userData.access_token);
    this.isLoggedIn = true;
    this.setUser({ ...userData.user, army: userReset().army });
  }

  logOut() {
    removeAccessToken();
    this.isLoggedIn = false;
    this.user = userReset();
  }

  setUser(user: IUser) {
    this.user = user;
  }
}

export const userStore = new UserStore();
