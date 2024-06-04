import { useMapEvents } from "react-leaflet";

export function LocationFinderDummy() {
  useMapEvents({
    click(e) {
      console.log(e.latlng.lat + " " + e.latlng.lng);
    },
  });
  return null;
}
