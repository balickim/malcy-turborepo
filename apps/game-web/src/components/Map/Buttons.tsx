import { IonButton, IonIcon } from "@ionic/react";
import { locateOutline } from "ionicons/icons";
import React from "react";
import { useDrag } from "react-dnd";

import { centerMapOnPlayer } from "~/utils/map";
import { IGeoLocation } from "~/utils/usePlayerPositionWatcher";

interface IButtons {
  playerLocation: IGeoLocation;
  mapRef: React.RefObject<L.Map>;
}

export default function Buttons({ mapRef, playerLocation }: IButtons) {
  const [, drag] = useDrag(() => ({
    type: "SETTLER",
    item: { name: "Settler" },
  }));

  return (
    <>
      <div
        ref={drag}
        className={"absolute bottom-36 right-2 z-[1500] cursor-grab"}
      >
        <IonButton className={"min-h-8 min-w-16"}>🏠</IonButton>
      </div>
      <IonButton
        onClick={() => centerMapOnPlayer(mapRef, playerLocation)}
        className={"absolute bottom-20 right-2 z-[1500] min-h-8 min-w-16"}
      >
        <IonIcon aria-hidden={"true"} ios={locateOutline} md={locateOutline} />
      </IonButton>
    </>
  );
}
