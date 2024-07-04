import { memo } from "react";
import { Marker } from "react-leaflet";

import { ISettlementDto } from "~/api/settlements/dtos";
import { userStore } from "~/store/userStore";

import { CustomMarkerIcon } from "../Settlements/CustomMarkerIcon";

const MemoizedMarker = memo(
  ({
    settlement,
    onMarkerClick,
  }: {
    settlement: ISettlementDto;
    onMarkerClick: (event: L.LeafletMouseEvent) => void;
  }) => (
    <Marker
      key={settlement.id}
      position={settlement}
      icon={CustomMarkerIcon({ settlement, userStore })}
      eventHandlers={{
        click: onMarkerClick,
      }}
    />
  ),
);
MemoizedMarker.displayName = "MemoizedMarker";

export default MemoizedMarker;
