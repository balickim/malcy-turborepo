import { IonButton, IonInput } from "@ionic/react";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { RefObject } from "react";
import toast from "react-hot-toast";

import SettlementsApi from "~/api/settlements";
import BasicModalBodyWrapper from "~/components/ui/BasicModalBodyWrapper.tsx";
import { IModalHandle } from "~/components/ui/BasicModalContainer.tsx";
import Tile from "~/components/ui/Tile.tsx";

interface ICreateSettlement {
  modalRef: RefObject<IModalHandle>;
  coords: { lat: number; lng: number };
  refetch: () => void;
}

export default function CreateSettlement({
  modalRef,
  coords,
  refetch,
}: ICreateSettlement) {
  const settlementsApi = new SettlementsApi();

  const createSettlementMutation = useMutation({
    mutationFn: settlementsApi.createSettlement,
  });

  return (
    <Formik
      initialValues={{
        name: "",
      }}
      onSubmit={async (values, formikHelpers) => {
        createSettlementMutation
          .mutateAsync({
            ...values,
            position: coords,
          })
          .then(() => {
            formikHelpers.resetForm();
            toast.success("Stworzyłeś osadę");
            refetch();
            modalRef.current?.close();
          });
      }}
    >
      {({ values, setFieldValue, handleSubmit }) => (
        <BasicModalBodyWrapper>
          <Tile>
            <form onSubmit={handleSubmit}>
              <IonInput
                label={"Nazwa osady"}
                value={values.name}
                clearInput={true}
                onIonInput={(e) =>
                  setFieldValue("name", e.target.value as string)
                }
                className="w-full !pl-1 text-start border-2 rounded-lg h-2"
              />

              <IonButton fill="clear" expand="block" type="submit">
                Stwórz
              </IonButton>
            </form>
          </Tile>
        </BasicModalBodyWrapper>
      )}
    </Formik>
  );
}
