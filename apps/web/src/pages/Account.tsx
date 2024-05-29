import { IonHeader, IonToolbar, IonTitle, IonButton } from "@ionic/react";
import { observer } from "mobx-react-lite";
import React from "react";

import PageContainer from "~/components/PageContainer";
import store from "~/store";

export default observer(function Account() {
  const { userStore } = store;

  const handleLogout = async () => {
    userStore.logOut();
    const event = new CustomEvent("unauthorized");
    window.dispatchEvent(event);
  };

  return (
    <PageContainer>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Konto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <pre>{JSON.stringify(userStore, null, 2)}</pre>

      <IonButton expand="block" onClick={handleLogout}>
        Wyloguj się
      </IonButton>
    </PageContainer>
  );
});
