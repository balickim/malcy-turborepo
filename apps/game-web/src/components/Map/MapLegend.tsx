import {
  createAnimation,
  IonCol,
  IonGrid,
  IonRow,
  IonText,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "shared-ui";

import { SettlementTypesEnum } from "~/api/settlements/dtos.ts";
import OnMapItemContainer from "~/components/Map/OnMapItemContainer";
import Button from "~/components/ui/Button";

const MapLegend = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bodyRef = useRef(null);

  const toggleVisibility = () => {
    if (isVisible) {
      setIsAnimating(true);
    }
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    if (bodyRef.current) {
      const animation = createAnimation()
        .addElement(bodyRef.current)
        .duration(100)
        .fromTo("transform", "translateX(-100%)", "translateX(0)");

      if (isVisible) {
        animation.direction("normal").play();
      } else {
        animation.direction("reverse").play();
      }

      animation.onFinish(() => {
        if (!isVisible) {
          setIsAnimating(false);
        }
      });
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible && isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match the animation duration

      return () => clearTimeout(timer);
    }

    return;
  }, [isVisible, isAnimating]);

  const settlementTypeName = {
    [SettlementTypesEnum.MINING_TOWN]: "Osada wydobywcza",
    [SettlementTypesEnum.CASTLE_TOWN]: "Miasteczko zamkowe",
    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: "Forteca",
    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: "Kapitol",
  };

  return (
    <OnMapItemContainer position="topleft" className={"mt-24"}>
      <Button size={"small"} className="m-0" onClick={toggleVisibility}>
        Legenda
      </Button>
      <div
        ref={bodyRef}
        className={cn(
          "bg-gray-800 bg-opacity-40 h-[300px] overflow-y-auto",
          !isVisible && !isAnimating ? "hidden" : "",
        )}
      >
        <IonGrid>
          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/player.gif"}
                alt={"player"}
                className="w-7 h-7"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Pozycja Gracza
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <div
                className={"w-7 h-7"}
                style={{
                  backgroundColor: "rgba(0, 123, 255, 0.5)",
                  borderRadius: "50%",
                  border: "2px solid #007bff",
                }}
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Zasięg działań Gracza
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <div
                className={"w-7 h-7"}
                style={{
                  backgroundColor: "#9da574",
                  borderRadius: "50%",
                  border: "2px solid gold",
                }}
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Siedlisko malców ze zwiększoną produkcją złota
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/settlements/types/mining_town.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                {settlementTypeName[SettlementTypesEnum.MINING_TOWN]}
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/settlements/types/castle_town.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                {settlementTypeName[SettlementTypesEnum.CASTLE_TOWN]}
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/settlements/types/fortified_settlement.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                {settlementTypeName[SettlementTypesEnum.FORTIFIED_SETTLEMENT]}
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/settlements/types/capitol_settlement.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                {settlementTypeName[SettlementTypesEnum.CAPITOL_SETTLEMENT]}
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <div className="w-7 h-7">
                <img
                  src={"assets/settlements/types/capitol_settlement.webp"}
                  alt={"player"}
                  className="w-7 h-7 rounded-full"
                />
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "65%",
                    width: "10px",
                    height: "10px",
                    backgroundColor: "yellow",
                    borderRadius: "50%",
                    transform: "translate(50%, 0%)",
                  }}
                />
              </div>
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Osada należąca do gracza
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <div className="w-7 h-7">
                <img
                  src={"assets/settlements/types/capitol_settlement.webp"}
                  alt={"player"}
                  className="w-7 h-7 rounded-full"
                />
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "65%",
                    width: "10px",
                    height: "10px",
                    backgroundColor: "red",
                    borderRadius: "50%",
                    transform: "translate(50%, 0%)",
                  }}
                />
              </div>
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Osada nie należąca do gracza
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <div
                className={"w-7 h-7"}
                style={{
                  borderRadius: "50%",
                  border: "2px solid #edb380",
                }}
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Teren kontrolowany przez osadę
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/units/swordsman_icon.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Ikona miecznika
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/units/archer_icon.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Ikona łucznika
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/units/knight_icon.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Ikona rycerza
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/units/luchador_icon.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Ikona luczadora
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/units/archmage_icon.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Ikona arcymaga
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/units/gold_icon.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Ikona zasobu złota
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size={"auto"}>
              <img
                src={"assets/units/wood_icon.webp"}
                alt={"player"}
                className="w-7 h-7 rounded-full"
              />
            </IonCol>
            <IonCol size={"6"} className={"text-nowrap"}>
              <IonText color={"light"} className={"font-bold"}>
                Ikona zasobu drewna
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
    </OnMapItemContainer>
  );
};

export default MapLegend;
