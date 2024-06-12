import { IDTOResponseFindHabitableZonesInBounds } from "shared-types";

import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";
import { IBounds } from "~/types/settlement.ts";
import { convertBoundsToSearchParams } from "~/utils/formatters.ts";

export default class HabitableZonesApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/habitable-zones`;

  getHabitableZones = async (
    bounds: IBounds,
  ): Promise<IApiResponse<IDTOResponseFindHabitableZonesInBounds[]>> => {
    const data = new URLSearchParams(convertBoundsToSearchParams(bounds));
    return fetchWrapper(`${this.basePath}/habitable-zones-in-bounds?${data}`);
  };
}
