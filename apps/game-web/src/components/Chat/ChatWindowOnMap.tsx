import { createAnimation } from "@ionic/react";
import { IonIcon } from "@ionic/react";
import { newspaper } from "ionicons/icons";
import { useState, useEffect, useRef } from "react";

import Chat from "~/components/Chat/index";
import OnMapItemContainer from "~/components/Map/OnMapItemContainer";
import Button from "~/components/ui/Button";

const ChatWindowOnMap = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const chatRef = useRef(null);
  const animationDurationMS = 100;

  const toggleChatVisibility = () => {
    if (isVisible) {
      setIsAnimating(true);
    }
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    if (chatRef.current) {
      const animation = createAnimation()
        .addElement(chatRef.current)
        .duration(animationDurationMS)
        .fromTo("transform", "translateY(100%)", "translateY(0)");

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
      }, animationDurationMS); // Match the animation duration

      return () => clearTimeout(timer);
    }

    return;
  }, [isVisible, isAnimating]);

  return (
    <OnMapItemContainer position="bottomleft">
      <Button size={"small"} className="m-0" onClick={toggleChatVisibility}>
        <IonIcon icon={newspaper} />
      </Button>
      <div
        ref={chatRef}
        className={`bg-gray-800 bg-opacity-40 ${
          !isVisible && !isAnimating ? "hidden" : ""
        }`}
      >
        <Chat />
      </div>
    </OnMapItemContainer>
  );
};

export default ChatWindowOnMap;
