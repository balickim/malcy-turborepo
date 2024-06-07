import { IonButton } from "@ionic/react";

import { Loading } from "~/components/Map/Loading.tsx";
import PageContainer from "~/components/PageContainer.tsx";
import store from "~/store";
import { useWorldList } from "~/utils/useWorldList.ts";

const SelectWorld = () => {
  const worldConfig = useWorldList();
  const { selectedWorldStore } = store;

  if (worldConfig.isFetching) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {worldConfig.data!.data.map((world) => {
        return (
          <IonButton
            onClick={() => selectedWorldStore.setConfig(world.id, world.name)}
            key={world.id}
          >
            {world.name}
          </IonButton>
        );
      })}
    </PageContainer>
  );
};

export default SelectWorld;
