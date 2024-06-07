import { makeAutoObservable } from "mobx";
import { WorldConfig } from "shared-types";

class ServerConfigStore {
  config: WorldConfig | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setConfig(config: WorldConfig) {
    this.config = config;
  }
}

export const serverConfigStore = new ServerConfigStore();
