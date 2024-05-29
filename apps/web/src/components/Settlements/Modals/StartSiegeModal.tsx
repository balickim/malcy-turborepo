import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { memo } from "react";

import CombatsApi from "~/api/combats/routes";
import FogOfWarApi from "~/api/fog-of-war/routes";
import { UnitSlider } from "~/components/Settlements/UnitSlider";
import store from "~/store";
import { TArmy, UnitType } from "~/types/army";
import { useUser } from "~/utils/useUser";

interface IViewSettlementModal {
  isOpen: boolean;
  closeModal: () => void;
  settlementId?: string;
  refetch: () => void;
}

const StartSiegeModal = memo(
  ({ isOpen, closeModal, settlementId, refetch }: IViewSettlementModal) => {
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
      <IonModal isOpen={isOpen} onWillDismiss={() => closeModal()}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => closeModal()}>Cancel</IonButton>
            </IonButtons>
            <IonTitle>Zacznij oblężenie osady</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
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
                <form onSubmit={handleSubmit}>
                  {Object.values(UnitType).map((unitType) => {
                    const max = userStore.user.army[unitType];
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
                    Rozpocznij
                  </IonButton>
                </form>
              </>
            )}
          </Formik>
        </IonContent>
      </IonModal>
    );
  },
);
StartSiegeModal.displayName = "PickUpOrPutDownArmyModal";

export default StartSiegeModal;
