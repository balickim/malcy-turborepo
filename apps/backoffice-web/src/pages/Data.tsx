import { useQuery } from "@tanstack/react-query";

import GameWorldBridgeApi from "~/api/gameWorldBridge";
import { Loading } from "~/components/Map/Loading.tsx";
import PageContainer from "~/components/PageContainer.tsx";

const Data = () => {
  const gameWorldBridgeApi = new GameWorldBridgeApi();
  const settlementsList = useQuery({
    queryKey: ["settlementsList"],
    queryFn: () => gameWorldBridgeApi.getSettlementList(),
  });

  if (settlementsList.isFetching) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <pre>{JSON.stringify(settlementsList.data?.data, null, 2)}</pre>
    </PageContainer>
  );
};

export default Data;
