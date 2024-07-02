import {
  IonModal,
  IonHeader,
  IonContent,
  IonTitle,
  IonIcon,
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
        <IonHeader className="bg-primary shadow-none px-7 h-16 pt-4 text-white flex justify-center items-center">
          <IonIcon
            icon={arrowBackOutline}
            onClick={() => setIsOpen(false)}
            size="large"
            className="transition-transform duration-300 ease-in-out transform hover:scale-110 active:scale-125"
          />
          {head ? (
            <IonTitle className="flex justify-center">{head}</IonTitle>
          ) : null}
        </IonHeader>
        <IonContent>
          <div className={"px-7 bg-primary"}>{body}</div>
        </IonContent>
      </IonModal>
    );
  },
);
BasicModalContainer.displayName = "BasicModalContainer";

export default BasicModalContainer;
