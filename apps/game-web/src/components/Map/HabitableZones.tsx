import { useQuery } from "@tanstack/react-query";
import { LatLngExpression } from "leaflet";
import isEqual from "lodash.isequal";
import { useMemo, useCallback, memo, useEffect, useRef, useState } from "react";
import { Pane, Polygon, useMap } from "react-leaflet";
import { IDTOResponseFindHabitableZonesInBounds } from "shared-types";

import FogOfWarApi from "~/api/fog-of-war/routes.ts";
import useMapBounds from "~/utils/useViewBounds.ts";

const POLYGON_COLOR = {
  GOLD: "gold",
  WOOD: "brown",
  IRON: "silver",
} as const;

const MemoizedPolygon = memo(
  ({ item }: { item: IDTOResponseFindHabitableZonesInBounds }) => {
    return (
      <Polygon
        key={item.id}
        positions={[...(item.area as unknown as LatLngExpression[])]}
        color={POLYGON_COLOR[item.type] || "green"}
      />
    );
  },
);
MemoizedPolygon.displayName = "MemoizedPolygon";

const useDeepCompareMemoize = (
  value: IDTOResponseFindHabitableZonesInBounds[],
) => {
  const ref = useRef<IDTOResponseFindHabitableZonesInBounds[]>();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};

const HabitableZones = () => {
  const fogOfWarApi = useMemo(() => new FogOfWarApi(), []);
  const map = useMap();
  const bounds = useMapBounds(map);
  const [habitableZones, setHabitableZones] = useState<
    IDTOResponseFindHabitableZonesInBounds[]
  >([]);

  const queryFn = useCallback(
    () => (bounds ? fogOfWarApi.getHabitableZones(bounds) : undefined),
    [bounds, fogOfWarApi],
  );

  const { data, isSuccess } = useQuery({
    queryKey: ["habitableZonesBounds", bounds],
    queryFn,
    enabled: !!bounds?.northEastLat,
  });

  useEffect(() => {
    if (isSuccess) {
      setHabitableZones(data?.data ?? []);
    }
  }, [isSuccess, data]);

  const memoizedZones = useDeepCompareMemoize(habitableZones);

  const polygons = useMemo(() => {
    return memoizedZones?.map((item) => (
      <MemoizedPolygon key={item.id} item={item} />
    ));
  }, [memoizedZones]);

  return <Pane name="zones">{polygons}</Pane>;
};

export default memo(HabitableZones);
