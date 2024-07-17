import {
  IonModal,
  IonHeader,
  IonContent,
  IonTitle,
  IonIcon,
  IonRow,
  IonGrid,
  IonCol,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { forwardRef, useImperativeHandle, useState, ReactNode } from "react";

export interface IModalHandle {
  open: () => void;
  close: () => void;
}

interface IBasicModalContainerProps {
  head?: string;
  body: ReactNode;
}

const BasicModalContainer = forwardRef<IModalHandle, IBasicModalContainerProps>(
  ({ head, body }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    return (
      <IonModal isOpen={isOpen} onWillDismiss={() => setIsOpen(false)}>
        <IonHeader className="bg-primary shadow-none px-7 text-white">
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol className="flex items-center">
                <IonIcon
                  icon={arrowBackOutline}
                  onClick={() => setIsOpen(false)}
                  size="large"
                  className="transition-transform duration-300 ease-in-out transform hover:scale-110 active:scale-125"
                />
              </IonCol>
              {head ? (
                <IonCol>
                  <IonTitle className="flex justify-center">{head}</IonTitle>
                </IonCol>
              ) : null}
            </IonRow>
          </IonGrid>
        </IonHeader>
        <IonContent>{body}</IonContent>
      </IonModal>
    );
  },
);
BasicModalContainer.displayName = "BasicModalContainer";

export default BasicModalContainer;
