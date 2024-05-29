import { IonButton, IonIcon, isPlatform } from "@ionic/react";
import { motion } from "framer-motion";
import { newspaper } from "ionicons/icons";
import React, { useState, useEffect } from "react";

import Chat from "~/components/Chat/index";

const ChatWindowOnMap = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleChatVisibility = () => {
    if (isVisible) {
      setIsAnimating(true);
    }
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    if (!isVisible && isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match the animation duration

      return () => clearTimeout(timer);
    }
  }, [isVisible, isAnimating]);

  const marginBottom = isVisible
    ? isPlatform("mobile")
      ? "50px"
      : "57px"
    : isPlatform("mobile")
      ? "104px"
      : "97px";

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isVisible ? 0 : "100%" }}
      transition={{ stiffness: 100 }}
      onAnimationComplete={() => {
        if (!isVisible) {
          setIsAnimating(false);
        }
      }}
      className={`absolute z-[1500] bottom-0`}
      style={{ marginBottom }}
    >
      <IonButton onClick={toggleChatVisibility}>
        <IonIcon icon={newspaper} />
      </IonButton>
      <div
        className={`bg-gray-800 bg-opacity-40 ${
          !isVisible && !isAnimating ? "hidden" : ""
        }`}
      >
        <Chat />
      </div>
    </motion.div>
  );
};

export default ChatWindowOnMap;
