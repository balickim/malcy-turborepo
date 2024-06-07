import { IonNote } from "@ionic/react";

import { version } from "../../package.json";

export default function AppVersion() {
  return (
    <IonNote
      className={"absolute bottom-1 left-1 z-[30000] text-[.6rem]"}
    >{`Ver. ${version}`}</IonNote>
  );
}
