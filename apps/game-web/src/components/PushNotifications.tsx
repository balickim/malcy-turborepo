import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from "@capacitor/push-notifications";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";

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
    console.log("Initializing PushNotification component");

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    const registerForPushNotifications = async () => {
      try {
        const permStatus = await PushNotifications.requestPermissions();
        if (permStatus.receive === "granted") {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
        } else {
          toast.error("Push notification permission not granted.");
        }
      } catch (error) {
        console.error("Error during permission request:", error);
        toast.error("Failed to request push notification permissions.");
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener("registration", (token: Token) => {
      console.log("Push registration success, token:", token.value);
      void sendToken(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener("registrationError", (error) => {
      console.error("Error during registration:", error);
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        toast("Push received: " + JSON.stringify(notification));
        console.log("Push notification received:", notification);
      },
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification: ActionPerformed) => {
        toast("Push action performed: " + JSON.stringify(notification));
        console.log("Push notification action performed:", notification);
      },
    );

    // Register for push notifications
    registerForPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  return null;
};

export default PushNotification;
