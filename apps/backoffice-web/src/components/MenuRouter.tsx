import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  mapOutline,
  mapSharp,
  logInOutline,
  logInSharp,
  document,
} from "ionicons/icons";
import { observer } from "mobx-react-lite";
import React from "react";
import { Redirect } from "react-router";
import { Route } from "react-router-dom";

import Data from "~/pages/Data";
import Map from "~/pages/Map";
import SelectWorld from "~/pages/SelectWorld.tsx";
import store from "~/store";

interface IAppPage {
  url: string;
  Component: React.FC;
}

interface IMenuItem {
  iosIcon: string;
  mdIcon: string;
  title: string;
  url: string;
}

const appPages: IAppPage[] = [
  {
    url: "/",
    Component: Map,
  },
  {
    url: "/select-world",
    Component: SelectWorld,
  },
  {
    url: "/data",
    Component: Data,
  },
];

export default observer(function MenuRouter() {
  const { selectedWorldStore } = store;

  const menuItems: IMenuItem[] = [
    ...(selectedWorldStore.worldName
      ? [
          {
            title: "Home",
            url: "/",
            iosIcon: mapOutline,
            mdIcon: mapSharp,
          },
          {
            title: "Data",
            url: "/data",
            iosIcon: document,
            mdIcon: document,
          },
        ]
      : [
          {
            title: "Wybór świata",
            url: "/select-world",
            iosIcon: logInOutline,
            mdIcon: logInSharp,
          },
        ]),
  ];

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet id="main">
          {appPages.map((page) => (
            <Route
              key={page.url}
              path={page.url}
              render={() => {
                if (
                  !selectedWorldStore.worldName &&
                  page.url !== "/select-world"
                )
                  return <Redirect to="/select-world" />;
                if (
                  selectedWorldStore.worldName &&
                  page.url === "/select-world"
                )
                  return <Redirect to="/" />;

                return <page.Component />;
              }}
              exact={true}
            />
          ))}
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          {menuItems.map((page) => (
            <IonTabButton
              key={page.url}
              tab={page.title.toLowerCase()}
              href={page.url}
            >
              <IonIcon icon={page.iosIcon} />
              <IonLabel>{page.title}</IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
});
