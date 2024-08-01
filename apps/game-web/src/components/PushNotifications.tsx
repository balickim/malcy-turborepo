import { PushNotifications } from "@capacitor/push-notifications";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";

import PushNotificationsApi from "~/api/push-notifications/routes.ts";

const PushNotification: React.FC = () => {
  const pushNotificationsApi = new PushNotificationsApi();
  const mutation = useMutation({
    mutationFn: pushNotificationsApi.updateToken,
  });

  const sendToken = async (token: string) => {
    try {
      await mutation.mutateAsync(token);
    } catch (error) {
      console.error("Error sending token to server:", error);
    }
  };

  useEffect(() => {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token: " + token.value);
      sendToken(token.value);
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push received: ", notification);
      },
    );

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log("Push action performed: ", notification);
      },
    );

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  return null;
};

export default PushNotification;
