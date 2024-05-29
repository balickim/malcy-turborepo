import { useIonRouter } from "@ionic/react";
import React, { memo, useEffect } from "react";

const AuthRedirector: React.FC = memo(() => {
  const router = useIonRouter();

  useEffect(() => {
    const handleUnauthorized = () => {
      router.push("/auth");
    };
    const handleLogin = () => {
      router.push("/");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    window.addEventListener("login", handleLogin);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
      window.removeEventListener("login", handleLogin);
    };
  }, [router]);

  return null;
});
AuthRedirector.displayName = "AuthRedirector";

export default AuthRedirector;
