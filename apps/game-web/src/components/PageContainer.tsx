import { IonContent, IonPage } from "@ionic/react";
import React from "react";

type IonPageProps = React.ComponentProps<typeof IonPage>;
type IonContentProps = React.ComponentProps<typeof IonContent>;

interface IPage extends IonPageProps {
  children: React.ReactNode;
  ionPageProps?: IonPageProps;
  ionContentProps?: IonContentProps;
}

const PageContainer: React.FC<IPage> = (props) => {
  const { children, ionContentProps } = props;
  return (
    <IonContent fullscreen {...ionContentProps}>
      {children}
    </IonContent>
  );
};

export default PageContainer;
