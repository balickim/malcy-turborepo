import { IonButton, IonIcon } from "@ionic/react";
import { locateOutline } from "ionicons/icons";
import React, { useCallback, useEffect } from "react";
import { useDrag } from "react-dnd";

import { centerMapOnPlayer } from "~/utils/map";
import { IGeoLocation } from "~/utils/usePlayerPositionWatcher";

interface IButtons {
  playerLocation: IGeoLocation;
  mapRef: React.RefObject<L.Map>;
}

export default function Buttons({ mapRef, playerLocation }: IButtons) {
  const [, drag] = useDrag(() => ({
    type: "SETTLEMENT",
    item: { name: "Settler" },
  }));

  const disableMapDragging = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.dragging.disable();
    }
  }, [mapRef]);

  const enableMapDragging = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.dragging.enable();
    }
  }, [mapRef]);

  useEffect(() => {
    return () => {
      enableMapDragging();
    };
  }, [enableMapDragging]);

  return (
    <div
      className={
        "leaflet-bottom leaflet-right z-[1500] mb-5 mr-2 flex flex-col gap-1"
      }
    >
      <div
        ref={drag}
        className={
          "cursor-grab leaflet-control-attribution leaflet-control p-0 flex flex-col !m-0 !bg-inherit"
        }
        onMouseDown={disableMapDragging}
        onMouseUp={enableMapDragging}
        onTouchStart={disableMapDragging}
        onTouchEnd={enableMapDragging}
      >
        <IonButton
          size={"small"}
          className={"m-0 min-h-8 min-w-16"}
          onMouseDown={disableMapDragging}
          onMouseUp={enableMapDragging}
          onTouchStart={disableMapDragging}
          onTouchEnd={enableMapDragging}
        >
          🏠
        </IonButton>
      </div>
      <IonButton
        size={"small"}
        onClick={() => centerMapOnPlayer(mapRef, playerLocation)}
        className={
          "min-h-8 min-w-16 z-[1500] leaflet-control-attribution leaflet-control p-0 flex flex-col !m-0 !bg-inherit"
        }
      >
        <IonIcon aria-hidden={"true"} ios={locateOutline} md={locateOutline} />
      </IonButton>
    </div>
  );
}
