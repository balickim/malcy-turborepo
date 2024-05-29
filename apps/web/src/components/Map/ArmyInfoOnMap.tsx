import { observer } from "mobx-react-lite";
import React from "react";

import { ArmyInfo } from "~/components/ArmyInfo";
import store from "~/store";

export default observer(function ArmyInfoOnMap() {
  const { userStore } = store;

  return (
    <div
      className={
        "absolute top-0 right-0 z-[1500] bg-gray-800 bg-opacity-40 p-2 rounded-bl text-white"
      }
    >
      <ArmyInfo army={userStore.user.army} />
    </div>
  );
});
