import { IonButton, IonSpinner } from "@ionic/react";
import React from "react";

interface IButton extends React.ComponentProps<typeof IonButton> {
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<IButton> = ({ children, isLoading, ...rest }) => {
  return (
    <IonButton {...rest} disabled={isLoading}>
      {isLoading ? <IonSpinner name="crescent" /> : children}
    </IonButton>
  );
};

export default Button;
