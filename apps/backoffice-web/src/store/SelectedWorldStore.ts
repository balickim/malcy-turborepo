import { makeAutoObservable } from "mobx";
import { IDTOResponseWorldsList } from "shared-types";

class SelectedWorldStore {
  worldId: IDTOResponseWorldsList["id"] | null = null;
  worldName: IDTOResponseWorldsList["name"] | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setConfig(worldId: string, worldName: string) {
    this.worldId = worldId;
    this.worldName = worldName;
  }
}

export const selectedWorldStore = new SelectedWorldStore();
