"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, CloudOff } from "lucide-react";
import toast from "react-hot-toast";
import { processSyncQueue } from "@/lib/sync-manager";
import { useAppStore } from "@/store/app-store";

interface SyncButtonProps {
  pendingCount?: number;
  onSyncComplete?: () => void;
}

export function SyncButton({ pendingCount = 0, onSyncComplete }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useAppStore((s) => s.isOnline);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Connect to internet to sync.");
      return;
    }

    if (isSyncing) return;

    setIsSyncing(true);

    try {
      const result = await processSyncQueue();

      if (result.failed > 0) {
        toast.error(
          `Sync partially failed: ${result.success} synced, ${result.failed} failed.`
        );
      } else if (result.success > 0) {
        toast.success(`${result.success} item(s) synced successfully.`);
        onSyncComplete?.();
      } else {
        toast("Nothing to sync.", { icon: "ℹ️" });
      }
    } catch {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (pendingCount === 0 && !isSyncing) {
    return (
      <div
        aria-label="All synced"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                   text-xs font-bold text-green-700 border border-green-200"
        style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        Synced
      </div>
    );
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing || !isOnline}
      aria-label={`Sync ${pendingCount} pending item(s)`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                 transition-all duration-150 border border-amber-200
                 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", color: "#92400e" }}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          Syncing...
        </>
      ) : (
        <>
          {isOnline ? (
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <CloudOff className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          Sync ({pendingCount})
        </>
      )}
    </button>
  );
}