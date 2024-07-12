import { IonHeader, IonToolbar, IonTitle, IonButton } from "@ionic/react";
import { observer } from "mobx-react-lite";

import AuthApi from "~/api/auth/routes.ts";
import PageContainer from "~/components/PageContainer";
import store from "~/store";

export default observer(function Account() {
  const { userStore } = store;
  const authApi = new AuthApi();

  const handleLogout = async () => {
    userStore.logOut();
    await authApi.logout();
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
      Username: {userStore.user.username}
      <IonButton expand="block" onClick={handleLogout}>
        Wyloguj się
      </IonButton>
    </PageContainer>
  );
});
