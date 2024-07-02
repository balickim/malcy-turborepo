import { IonButton } from "@ionic/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import { memo } from "react";

import SettlementsApi from "~/api/settlements";
import { UnitSlider } from "~/components/Settlements/UnitSlider";
import store from "~/store";
import { UnitType } from "~/types/army";
import { useUser } from "~/utils/useUser";

interface IArmyDeployment {
  settlementId: string;
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
        <>
          <form onSubmit={handleSubmit}>
            {Object.values(UnitType).map((unitType) => {
              const max =
                type === "put_down"
                  ? userStore.user.army[unitType]
                  : settlementData.army[unitType];
              return (
                <div key={unitType} className={"flex items-center mx-20"}>
                  <UnitSlider
                    unitType={unitType}
                    unitCount={values[unitType]}
                    setUnitCount={(unitCount) =>
                      setFieldValue(unitType, unitCount)
                    }
                    min={0}
                    max={max}
                    disabled={max === 0}
                  />
                  <p
                    className={
                      "text-cyan-300 hover:cursor-pointer hover:text-cyan-500"
                    }
                    onClick={() =>
                      setFieldValue(unitType, max - values[unitType])
                    }
                  >
                    ({max - values[unitType]})
                  </p>
                </div>
              );
            })}

            <IonButton fill="clear" expand="block" type="submit">
              {type === "pick_up" ? <>Podnieś</> : <>Upuść</>}
            </IonButton>
          </form>
        </>
      )}
    </Formik>
  );
});

ArmyDeployment.displayName = "ArmyDeployment";

export default ArmyDeployment;
