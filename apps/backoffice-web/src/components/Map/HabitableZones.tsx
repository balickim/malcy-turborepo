import { Pane } from "react-leaflet";

// import useMapBounds from "~/utils/useViewBounds.ts";

// const POLYGON_COLOR = {
//   GOLD: "gold",
//   WOOD: "brown",
//   IRON: "silver",
// } as const;

const HabitableZones = () => {
  // const map = useMap();
  // const bounds = useMapBounds(map);

  // const { data } = useQuery({
  //   queryKey: ["habitableZonesBounds", bounds],
  //   queryFn: () => (bounds ? fogOfWarApi.getHabitableZones(bounds) : undefined),
  //   enabled: !!bounds,
  //   refetchInterval: 5000,
  // });

  // if (!data?.data) return null;
  return (
    <Pane name={"zones"}>
      {/*{data.data.map((item) => (*/}
      {/*  <Polygon*/}
      {/*    key={item.id}*/}
      {/*    positions={[...(item.area as unknown as LatLngExpression[])]}*/}
      {/*    color={POLYGON_COLOR[item.type]}*/}
      {/*  />*/}
      {/*))}*/}
    </Pane>
  );
};

export default HabitableZones;
