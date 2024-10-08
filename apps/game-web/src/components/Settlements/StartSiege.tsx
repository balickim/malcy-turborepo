import { IonButton, IonSelect, IonSelectOption } from "@ionic/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import { memo } from "react";
import { StartSiegeDto } from "shared-nestjs";
import { UnitType as SharedUnitType, SiegeTypes } from "shared-types";

import CombatsApi from "~/api/combats/routes";
import FogOfWarApi from "~/api/fog-of-war/routes";
import { ArmyInfo } from "~/components/ArmyInfo.tsx";
import { UnitSlider } from "~/components/Settlements/UnitSlider";
import BasicModalBodyWrapper from "~/components/ui/BasicModalBodyWrapper.tsx";
import Tile from "~/components/ui/Tile.tsx";
import store from "~/store";
import { UnitType } from "~/types/army";
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
    mutationFn: (data: Omit<StartSiegeDto, "settlementId">) =>
      combatsApi.startSiege({
        army: data.army,
        siegeType: data.siegeType,
        settlementId: settlementId!,
      }),
  });

  if (!settlementData) return null;
  return (
    <Formik
      initialValues={{
        [UnitType.SWORDSMAN]: 0,
        [UnitType.ARCHER]: 0,
        [UnitType.KNIGHT]: 0,
        [UnitType.LUCHADOR]: 0,
        [UnitType.ARCHMAGE]: 0,
        siegeType: SiegeTypes.DESTRUCTION,
      }}
      onSubmit={async (values, formikHelpers) => {
        const { siegeType, ...army } = values;
        await mutation.mutateAsync({
          army: army as unknown as Record<SharedUnitType, number>,
          siegeType: siegeType,
        });
        formikHelpers.resetForm();
        void user.refetch();
        void refetch();
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

                <IonSelect
                  interface="action-sheet"
                  label="Rodzaj oblężenia"
                  value={values.siegeType}
                  onIonChange={(e) =>
                    setFieldValue("siegeType", e.detail.value)
                  }
                >
                  <IonSelectOption value={SiegeTypes.DESTRUCTION}>
                    Zniszczenie
                  </IonSelectOption>
                  <IonSelectOption value={SiegeTypes.TAKE_OVER}>
                    Przejęcie
                  </IonSelectOption>
                </IonSelect>

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
