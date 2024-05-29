import { makeAutoObservable } from "mobx";

import { IGameConfigDto } from "~/api/config/dtos";

class ServerConfigStore {
  config: IGameConfigDto | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setConfig(config: IGameConfigDto) {
    this.config = config;
  }
}

export const serverConfigStore = new ServerConfigStore();
