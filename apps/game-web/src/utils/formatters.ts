import { IBounds } from "~/types/settlement";

export function convertBoundsToSearchParams(bounds: IBounds): URLSearchParams {
  const paramsObj: Record<string, string> = {
    southWestLat: bounds.southWestLat.toString(),
    southWestLng: bounds.southWestLng.toString(),
    northEastLat: bounds.northEastLat.toString(),
    northEastLng: bounds.northEastLng.toString(),
  };
  return new URLSearchParams(paramsObj);
}
