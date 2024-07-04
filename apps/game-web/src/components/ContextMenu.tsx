import { createAnimation } from "@ionic/react";
import { useEffect, useRef } from "react";

interface IContextMenuItem {
  icon: string;
  onClick?: () => void;
  link?: string;
}

interface IContextMenu {
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number } | null) => void;
  items: IContextMenuItem[];
}

export default function ContextMenu({
  position,
  setPosition,
  items,
}: IContextMenu) {
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePositions = (count: number, radius: number) => {
    const positions = [];
    const step = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const angle = i * step + (count === 2 ? (5 * Math.PI) / 4 : 0);
      positions.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    return positions;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setPosition]);

  useEffect(() => {
    if (menuRef.current) {
      const elements = Array.from(menuRef.current.children);
      const buttonPositions = calculatePositions(items.length, 40);

      elements.forEach((el, index) => {
        const animation = createAnimation()
          .addElement(el)
          .duration(500)
          .keyframes([
            { offset: 0, opacity: "0", transform: "translate(0, 0)" },
            {
              offset: 1,
              opacity: "1",
              transform: `translate(${buttonPositions[index].x}px, ${buttonPositions[index].y}px)`,
            },
          ]);

        animation.play();
      });
    }
  }, [items.length, position]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: position.y - 15, // adjust for icon size
        left: position.x - 15, // adjust for icon size
        zIndex: 30000,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          onClick={(e) => {
            e.preventDefault();
            item.onClick?.();
          }}
          style={{
            position: "absolute",
            cursor: "pointer",
            width: "31px",
            height: "31px",
          }}
        >
          <img
            src={item.icon}
            alt={`item ${index}`}
            className="rounded-full hover:brightness-125"
          />
        </div>
      ))}
    </div>
  );
}
