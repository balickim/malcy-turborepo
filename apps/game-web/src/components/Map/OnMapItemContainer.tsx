import React, { forwardRef } from "react";
import { cn } from "shared-ui";

const POSITION_CLASSES = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
} as const;

const OnMapItemContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    position: keyof typeof POSITION_CLASSES;
  }
>(({ children, position, ...rest }, ref) => {
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  return (
    <div className={cn(positionClass, rest.className)} ref={ref} {...rest}>
      <div className="leaflet-control-attribution leaflet-control p-0 flex flex-col !m-0 !bg-inherit">
        {children}
      </div>
    </div>
  );
});
OnMapItemContainer.displayName = "OnMapItemContainer";

export default OnMapItemContainer;
