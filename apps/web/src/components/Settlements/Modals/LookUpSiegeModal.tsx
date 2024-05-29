import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { memo, useEffect } from "react";

import CombatsApi from "~/api/combats/routes";
import { ISettlementDto } from "~/api/settlements/dtos";
import { UnitSlider } from "~/components/Settlements/UnitSlider";
import store from "~/store";
import { UnitType } from "~/types/army";
import { useUser } from "~/utils/useUser";

interface IViewSettlementModal {
  isOpen: boolean;
  closeModal: () => void;
  settlement?: ISettlementDto;
  refetch: () => void;
}

const LookUpSiegeModal = memo(
  ({ isOpen, closeModal, settlement }: IViewSettlementModal) => {
    const combatsApi = new CombatsApi();
    const { userStore } = store;
    const user = useUser({ enabled: false });

    const { data: siege } = useQuery({
      queryKey: ["getSiegeById", settlement?.id],
      queryFn: () =>
        settlement?.id ? combatsApi.getSiege(settlement?.id) : undefined,
      enabled: !!settlement?.siege,
      refetchInterval: 3000,
    });
    const siegeData = siege?.data;

    // const mutation = useMutation({
    //   mutationFn: (data: TArmy) =>
    //     combatsApi.startSiege({
    //       army: data,
    //       settlementId: settlementId!,
    //     }),
    // });
    //
    // const startSiege = async (data: TArmy) => {
    //   await mutation.mutateAsync(data);
    //   refetch();
    // };

    return (
      <IonModal isOpen={isOpen} onWillDismiss={() => closeModal()}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => closeModal()}>Cancel</IonButton>
            </IonButtons>
            <IonTitle>Oblężenie</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {JSON.stringify(siegeData, null, 2)}
          <Formik
            initialValues={{
              [UnitType.SWORDSMAN]: 0,
              [UnitType.ARCHER]: 0,
              [UnitType.KNIGHT]: 0,
              [UnitType.LUCHADOR]: 0,
              [UnitType.ARCHMAGE]: 0,
            }}
            onSubmit={async (values, formikHelpers) => {
              // await startSiege(values);
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
LookUpSiegeModal.displayName = "PickUpOrPutDownArmyModal";

export default LookUpSiegeModal;
