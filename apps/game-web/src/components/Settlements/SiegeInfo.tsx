import { useQuery } from "@tanstack/react-query";
import { memo } from "react";

import CombatsApi from "~/api/combats/routes";
import { ISettlementDto } from "~/api/settlements/dtos";

interface ISiegeInfo {
  settlement?: ISettlementDto;
  refetch: () => void;
}

const SiegeInfo = memo(({ settlement }: ISiegeInfo) => {
  const combatsApi = new CombatsApi();

  const { data: siege } = useQuery({
    queryKey: ["getSiegeById", settlement?.id],
    queryFn: () =>
      settlement?.id ? combatsApi.getSiege(settlement?.id) : undefined,
    enabled: !!settlement?.siege,
    refetchInterval: 3000,
  });
  const siegeData = siege?.data;

  return <pre>{JSON.stringify(siegeData, null, 2)}</pre>;
});
SiegeInfo.displayName = "SiegeInfo";

export default SiegeInfo;
