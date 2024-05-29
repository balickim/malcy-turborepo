import { IonSpinner } from "@ionic/react";
import React from "react";

export function NoPlayerPositionInfo() {
  return (
    <>
      <IonSpinner />
      Czekam na ustalenie pozycji gracza
    </>
  );
}
