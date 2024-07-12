import React, { forwardRef } from "react";
import { useMap } from "react-leaflet";
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
  const map = useMap();
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const disableMapDragging = () => {
    map.dragging.disable();
  };

  const enableMapDragging = () => {
    map.dragging.enable();
  };

  return (
    <div
      className={cn(positionClass, "z-[1500]", rest.className)}
      ref={ref}
      {...rest}
    >
      <div
        className="leaflet-control-attribution leaflet-control p-0 flex flex-col !m-0 !bg-inherit"
        onMouseDown={disableMapDragging}
        onMouseUp={enableMapDragging}
        onTouchStart={disableMapDragging}
        onTouchEnd={enableMapDragging}
      >
        {children}
      </div>
    </div>
  );
});
OnMapItemContainer.displayName = "OnMapItemContainer";

export default OnMapItemContainer;
