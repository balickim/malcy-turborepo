import {
  IDTOResponseFindHabitableZonesInBounds,
  IDtoHabitableZone,
} from "shared-types";

import { fetchWrapper } from "~/api/fetch";
import { IApiResponse } from "~/types/common";
import { IBounds } from "~/types/settlement.ts";
import { convertBoundsToSearchParams } from "~/utils/formatters.ts";

export default class HabitableZonesApi {
  private readonly basePath = `${import.meta.env.VITE_BACKOFFICE_API_URL}/habitable-zones`;

  getHabitableZones = async (
    bounds: IBounds,
  ): Promise<IApiResponse<IDTOResponseFindHabitableZonesInBounds[]>> => {
    const data = new URLSearchParams(convertBoundsToSearchParams(bounds));
    return fetchWrapper(`${this.basePath}/habitable-zones-in-bounds?${data}`);
  };

  create = async (body: Omit<IDtoHabitableZone, "id">) => {
    return fetchWrapper(`${this.basePath}/create`, {
      body: JSON.stringify(body),
      method: "POST",
    });
  };

  edit = async (body: IDtoHabitableZone) => {
    return fetchWrapper(`${this.basePath}/edit`, {
      body: JSON.stringify(body),
      method: "PUT",
    });
  };

  delete = async (body: Pick<IDtoHabitableZone, "id">) => {
    return fetchWrapper(`${this.basePath}/delete`, {
      body: JSON.stringify(body),
      method: "DELETE",
    });
  };
}
