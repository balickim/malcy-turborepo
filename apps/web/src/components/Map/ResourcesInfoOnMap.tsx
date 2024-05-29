import { observer } from "mobx-react-lite";
import React from "react";

import { ResourcesInfo } from "~/components/ResourcesInfo";
import store from "~/store";

export default observer(function ResourcesInfoOnMap() {
  const { userStore } = store;

  return (
    <div
      className={
        "absolute top-0 right-1/2 z-[1000] bg-gray-800 bg-opacity-40 p-2 rounded-bl text-white"
      }
    >
      <ResourcesInfo gold={userStore.user.gold} wood={userStore.user.wood} />
    </div>
  );
});
