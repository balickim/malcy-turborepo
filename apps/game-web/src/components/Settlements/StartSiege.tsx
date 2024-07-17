import { IonButton } from "@ionic/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import { memo } from "react";

import CombatsApi from "~/api/combats/routes";
import FogOfWarApi from "~/api/fog-of-war/routes";
import { ArmyInfo } from "~/components/ArmyInfo.tsx";
import { UnitSlider } from "~/components/Settlements/UnitSlider";
import BasicModalBodyWrapper from "~/components/ui/BasicModalBodyWrapper.tsx";
import Tile from "~/components/ui/Tile.tsx";
import store from "~/store";
import { TArmy, UnitType } from "~/types/army";
import { useUser } from "~/utils/useUser";

interface IStartSiege {
  settlementId?: string;
  refetch: () => void;
}

const StartSiege = memo(({ settlementId, refetch }: IStartSiege) => {
  const combatsApi = new CombatsApi();
  const fogOfWarApi = new FogOfWarApi();
  const { userStore } = store;
  const user = useUser({ enabled: false });

  const { data: settlement } = useQuery({
    queryKey: ["getSettlementById", settlementId],
    queryFn: () =>
      settlementId
        ? fogOfWarApi.getDiscoveredSettlementById(settlementId)
        : undefined,
    enabled: !!settlementId,
  });
  const settlementData = settlement?.data;

  const mutation = useMutation({
    mutationFn: (data: TArmy) =>
      combatsApi.startSiege({
        army: data,
        settlementId: settlementId!,
      }),
  });

  const startSiege = async (data: TArmy) => {
    await mutation.mutateAsync(data);
    refetch();
  };

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
        await startSiege(values);
        formikHelpers.resetForm();
        await user.refetch();
      }}
    >
      {({ values, setFieldValue, handleSubmit }) => (
        <>
          <div className="flex justify-end bg-gray-800 bg-opacity-40 p-2 text-white">
            <ArmyInfo
              army={{
                swordsman: settlementData[UnitType.SWORDSMAN],
                archer: settlementData[UnitType.ARCHER],
                knight: settlementData[UnitType.KNIGHT],
                luchador: settlementData[UnitType.LUCHADOR],
                archmage: settlementData[UnitType.ARCHMAGE],
              }}
            />
          </div>

          <BasicModalBodyWrapper>
            <Tile>
              <form onSubmit={handleSubmit}>
                {Object.values(UnitType).map((unitType) => {
                  const max = userStore.user.army[unitType];
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
                  Rozpocznij
                </IonButton>
              </form>
            </Tile>
          </BasicModalBodyWrapper>
        </>
      )}
    </Formik>
  );
});

StartSiege.displayName = "StartSiege";

export default StartSiege;
