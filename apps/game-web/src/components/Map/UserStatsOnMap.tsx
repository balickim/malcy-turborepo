import { observer } from "mobx-react-lite";

import { ArmyInfo } from "~/components/ArmyInfo";
import { ResourcesInfo } from "~/components/ResourcesInfo";
import store from "~/store";

import OnMapItemContainer from "./OnMapItemContainer";

export default observer(function UserStatsOnMap() {
  const { userStore } = store;

  return (
    <OnMapItemContainer position="topright">
      <div className="bg-gray-800 bg-opacity-40 p-2 rounded-bl text-white">
        <ArmyInfo army={userStore.user.army} />
      </div>
      <div className="bg-gray-800 bg-opacity-40 p-2 rounded-bl text-white">
        <ResourcesInfo
          gold={userStore.user.gold}
          wood={userStore.user.wood}
          iron={userStore.user.iron}
        />
      </div>
    </OnMapItemContainer>
  );
});
