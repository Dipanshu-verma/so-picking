"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function useOnlineStatus(): boolean {
  const { isOnline, setOnline } = useAppStore();

  useEffect(() => {
    // Set initial state
    setOnline(navigator.onLine);

    const handleOnline = () => {
      setOnline(true);
      console.log("[Network] Back online");
    };

    const handleOffline = () => {
      setOnline(false);
      console.log("[Network] Gone offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);

  return isOnline;
}