"use client";

import { useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function OnlineStatus() {
  const { isOnline, setOnline } = useAppStore();

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);

  return (
    <div
      aria-label={isOnline ? "Online" : "Offline"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                  transition-all duration-300 ${
                    isOnline
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
    >
      {isOnline ? (
        <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span>{isOnline ? "Online" : "Offline"}</span>
    </div>
  );
}