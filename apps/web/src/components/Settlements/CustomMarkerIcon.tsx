import L from "leaflet";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ISettlementDto } from "~/api/settlements/dtos";
import { userStore as store } from "~/store/userStore";

interface ICustomMarkerProps {
  settlement: ISettlementDto;
  userStore: typeof store;
}

export const CustomMarkerIcon = ({
  settlement,
  userStore,
}: ICustomMarkerProps) => {
  const isOwned = settlement.user.id === userStore.user.id;
  const isSiege = !!settlement.siege;
  const iconUrl = `assets/settlements/types/${settlement.type.toLowerCase()}.webp`;
  const siegeUrl = `assets/siege_base.png`;

  const iconHtml = renderToStaticMarkup(
    <div style={{ position: "relative" }}>
      <img
        src={iconUrl}
        alt={`settlement ${settlement.name} image`}
        style={{ width: "30px", height: "30px", borderRadius: "50%" }}
      />
      {isOwned && (
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
      )}
      {isSiege && (
        <img
          src={siegeUrl}
          alt={`settlement ${settlement.name} image`}
          style={{
            position: "absolute",
            top: "-40%",
            left: "-45%",
            zIndex: "-1",
            width: "55px",
            height: "55px",
            borderRadius: "50%",
          }}
        />
      )}
    </div>,
  );

  return L.divIcon({
    html: iconHtml,
    className: "rounded-full",
    iconSize: [30, 30],
  });
};
