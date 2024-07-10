import { memo } from "react";
import { Circle, Marker } from "react-leaflet";

import { ISettlementDto } from "~/api/settlements/dtos";
import { userStore } from "~/store/userStore";

import { CustomMarkerIcon } from "../Settlements/CustomMarkerIcon";

const MemoizedMarker = memo(
  ({
    settlement,
    onMarkerClick,
    radius,
  }: {
    settlement: ISettlementDto;
    onMarkerClick: (event: L.LeafletMouseEvent) => void;
    radius: number;
  }) => (
    <>
      <Marker
        key={settlement.id}
        position={settlement}
        icon={CustomMarkerIcon({ settlement, userStore })}
        eventHandlers={{
          click: onMarkerClick,
        }}
      />
      <Circle
        center={settlement}
        radius={radius}
        fill={false}
        color={"#edb380"}
      />
    </>
  ),
);
MemoizedMarker.displayName = "MemoizedMarker";

export default MemoizedMarker;
