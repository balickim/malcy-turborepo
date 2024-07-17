import { IonButton } from "@ionic/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import { memo } from "react";

import SettlementsApi from "~/api/settlements";
import { UnitSlider } from "~/components/Settlements/UnitSlider";
import BasicModalBodyWrapper from "~/components/ui/BasicModalBodyWrapper.tsx";
import Tile from "~/components/ui/Tile.tsx";
import store from "~/store";
import { UnitType } from "~/types/army";
import { useUser } from "~/utils/useUser";

interface IArmyDeployment {
  settlementId?: string;
  type: "pick_up" | "put_down";
}

const ArmyDeployment = memo(({ settlementId, type }: IArmyDeployment) => {
  const settlementsApi = new SettlementsApi();
  const user = useUser({ enabled: false });
  const { userStore } = store;
  const pickUpArmyMutation = useMutation({
    mutationFn:
      type === "pick_up"
        ? settlementsApi.pickUpArmy
        : settlementsApi.putDownArmy,
  });

  const { data } = useQuery({
    queryKey: ["getSettlementById", settlementId],
    queryFn: () =>
      settlementId ? settlementsApi.getSettlementById(settlementId) : undefined,
    enabled: !!settlementId,
  });
  const settlementData = data?.data;

  if (!settlementData) return null;

  return (
    <Formik
      initialValues={{
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
      }}
      onSubmit={async (values, formikHelpers) => {
        await pickUpArmyMutation.mutateAsync({
          settlementId: settlementData?.id,
          ...values,
        });
        formikHelpers.resetForm();
        await user.refetch();
      }}
    >
      {({ values, setFieldValue, handleSubmit }) => (
        <BasicModalBodyWrapper>
          <Tile>
            <form onSubmit={handleSubmit}>
              {Object.values(UnitType).map((unitType) => {
                const max =
                  type === "put_down"
                    ? userStore.user.army[unitType]
                    : settlementData.army[unitType];
                return (
                  <UnitSlider
                    key={unitType}
                    unitType={unitType}
                    unitCount={values[unitType]}
                    setUnitCount={(unitCount) =>
                      setFieldValue(unitType, unitCount)
                    }
                    min={0}
                    max={max}
                    disabled={max === 0}
                  />
                );
              })}

              <IonButton fill="clear" expand="block" type="submit">
                {type === "pick_up" ? <>Podnieś</> : <>Upuść</>}
              </IonButton>
            </form>
          </Tile>
        </BasicModalBodyWrapper>
      )}
    </Formik>
  );
});
ArmyDeployment.displayName = "ArmyDeployment";

export default ArmyDeployment;
