import { Preferences } from "@capacitor/preferences";
import { isPlatform } from "@ionic/react";
import { makeAutoObservable } from "mobx";
import {
  makePersistable,
  isPersisting,
  stopPersisting,
} from "mobx-persist-store";

import { IUser } from "~/types/user";

const userReset = (): IUser => {
  return {
    id: "",
    email: "",
    username: "",
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

  async logIn(userData: { session_id: string; user: IUser } | string) {
    this.isLoggedIn = true;
    if (typeof userData !== "string") {
      this.setUser({ ...userData.user, army: userReset().army });
      if (isPlatform("mobile")) {
        await Preferences.set({
          key: "session_id",
          value: userData.session_id,
        });
      }
    }
  }

  async logOut() {
    this.isLoggedIn = false;
    this.user = userReset();

    if (isPlatform("mobile")) {
      await Preferences.remove({ key: "session_id" });
    }
  }

  setUser(user: IUser) {
    this.user = user;
  }
}

export const userStore = new UserStore();
