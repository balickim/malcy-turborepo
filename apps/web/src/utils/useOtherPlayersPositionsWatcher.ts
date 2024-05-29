import { useEffect, useState } from "react";

import { websocketUserLocation } from "~/store/websocketStore";

export interface IOtherPlayerPosition {
  userId: string;
  latitude: string;
  longitude: string;
}

export function useOthersPlayersPositionsWatcher() {
  const [otherPlayersPositions, setOtherPlayersPositions] = useState<
    IOtherPlayerPosition[] | null
  >(null);

  useEffect(() => {
    const handleNewPlayerPosition = (positions: IOtherPlayerPosition[]) => {
      setOtherPlayersPositions(positions);
    };

    websocketUserLocation.socket?.on(
      "otherPlayersPositions",
      handleNewPlayerPosition,
    );
  }, [websocketUserLocation.socket]);

  return otherPlayersPositions;
}
