import { IonCol, IonGrid, IonProgressBar, IonRow, IonText } from "@ionic/react";

import Tile from "~/components/ui/Tile.tsx";

interface IAppLoadingProps {
  ionProgressBarValue: number;
}

export default function AppLoading(props: IAppLoadingProps) {
  const { ionProgressBarValue } = props;

  return (
    <div className="flex justify-center items-end h-5/6">
      <div className={"w-2/3"}>
        <Tile>
          <IonGrid>
            <IonRow className="ion-align-items-center ion-justify-content-center">
              <IonCol>
                <IonText color={"dark"} className="text-2xl animate-pulse">
                  Ładowanie...
                </IonText>
                <IonProgressBar value={ionProgressBarValue}></IonProgressBar>
              </IonCol>
            </IonRow>
          </IonGrid>
        </Tile>
      </div>
    </div>
  );
}
