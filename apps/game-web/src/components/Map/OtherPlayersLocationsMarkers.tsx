import L from "leaflet";
import { Marker } from "react-leaflet";

import { IOtherPlayerPosition } from "~/utils/useOtherPlayersPositionsWatcher";

const walkingManIcon = L.icon({
  iconUrl: "assets/player.gif",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export function OtherPlayersLocationMarker({
  locations,
}: {
  locations: IOtherPlayerPosition[] | null;
}) {
  return locations ? (
    <>
      {locations.map((location) => {
        return (
          <Marker
            key={location.userId}
            position={{
              lat: Number(location.latitude),
              lng: Number(location.longitude),
            }}
            icon={walkingManIcon}
          />
        );
      })}
    </>
  ) : null;
}
