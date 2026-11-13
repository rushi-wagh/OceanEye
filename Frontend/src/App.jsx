import { useEffect } from "react";
import { Router } from "@/app/router";
import { ToastProvider } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";

const App = () => {
  useEffect(() => {
    const handleUnauthorized = () => {
      useAuthStore.getState().clearAuth();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    void useAuthStore.getState().initializeAuth();

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <>
      <ToastProvider />
      <Router />
    </>
  );
};

export default App;
