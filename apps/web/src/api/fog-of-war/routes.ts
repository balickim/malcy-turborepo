import { LatLngTuple } from "leaflet";

import { fetchWrapper } from "~/api/fetch";
import { IDiscoveredSettlement } from "~/api/fog-of-war/dtos";
import { ISettlementDto } from "~/api/settlements/dtos";
import { IApiResponse } from "~/types/common";
import { IBounds } from "~/types/settlement";
import { convertBoundsToSearchParams } from "~/utils/formatters";

export default class FogOfWarApi {
  private readonly basePath = `${import.meta.env.VITE_API_URL}/fog-of-war`;

  getUsersDiscoveredAreas = async (): Promise<IApiResponse<LatLngTuple[]>> => {
    return fetchWrapper(`${this.basePath}/discovered-areas`);
  };

  getUsersVisibleAreas = async (): Promise<IApiResponse<LatLngTuple[]>> => {
    return fetchWrapper(`${this.basePath}/visible-areas`);
  };

  getSettlements = async (
    bounds: IBounds,
  ): Promise<IApiResponse<ISettlementDto>> => {
    const data = new URLSearchParams(convertBoundsToSearchParams(bounds));
    return fetchWrapper(`${this.basePath}/bounds?${data}`);
  };

  getDiscoveredSettlementById = async (
    id: string,
  ): Promise<IApiResponse<IDiscoveredSettlement>> => {
    return fetchWrapper(`${this.basePath}/${id}`);
  };
}
