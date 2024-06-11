import { makeAutoObservable } from "mobx";
import {
  isPersisting,
  makePersistable,
  stopPersisting,
} from "mobx-persist-store";
import { IDTOResponseWorldsList } from "shared-types";

class SelectedWorldStore {
  worldId: IDTOResponseWorldsList["id"] | null = null;
  worldName: IDTOResponseWorldsList["name"] | null = null;

  constructor() {
    makeAutoObservable(this);
    const storageName = "UserStore";
    if (isPersisting(this)) {
      stopPersisting(this);
    }
    makePersistable(this, {
      name: storageName,
      properties: ["worldId", "worldName"],
      storage: window.localStorage,
    });
  }

  setConfig(worldId: string, worldName: string) {
    this.worldId = worldId;
    this.worldName = worldName;
  }
}

export const selectedWorldStore = new SelectedWorldStore();
