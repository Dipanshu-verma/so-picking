"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  errorQueueDB,
  pickingProgressDB,
  soDetailsDB,
  soListDB,
} from "@/lib/offline-db";
import { usePickingStore } from "@/store/picking-store";
import { useOfflineStore } from "@/store/offline-store";
import { SOStatus, SyncStatus,LocationStatus } from "@/constants";
import { generateSyncId } from "@/lib/utils";
import type { PickingError } from "@/types/errors";

interface UseSubmitReturn {
  soId: string;
  errors: PickingError[];
  isOnline: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
  totalLocations: number;
  completedLocations: number;
  pickedCount: number; 
  errorCount: number;
  canSubmit: boolean;
  handleSubmit: () => Promise<void>;
  handleRetry: () => void;
}

export function useSubmit(soId: string): UseSubmitReturn {
  const router = useRouter();
  const { activeSO, clearActiveSO } = usePickingStore();
  const { clearErrors } = useOfflineStore();
const [pickedCount, setPickedCount] = useState(0);
  const [errors, setErrors] = useState<PickingError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Stable syncId — generated once per submit session
  // Stored in a ref so retries reuse the same syncId (idempotency)
  const syncIdRef = useRef<string>(generateSyncId(soId));

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
  if (!activeSO) return;
  const count = activeSO.locations.filter(
    (l) => l.status === LocationStatus.COMPLETED
  ).length;
  setPickedCount(count);
}, [activeSO]);


  // Load errors from IndexedDB on mount
  useEffect(() => {
    const loadErrors = async () => {
      try {
        const queueItems = await errorQueueDB.getBySOId(soId);
        const pickingErrors = queueItems.map((item) => item.error);
        setErrors(pickingErrors);
      } catch (err) {
        console.error("[useSubmit] Failed to load errors:", err);
      }
    };
    loadErrors();
  }, [soId]);

  // Derived stats
  const totalLocations = activeSO?.totalLocations ?? 0;
const completedLocations = activeSO?.completedLocations ?? 0;
const errorCount = errors.length;
 
  const canSubmit = isOnline && !isSubmitting && !isSubmitted;

  // ── Clear all local data for this SO after successful submit ──────
  const clearLocalData = useCallback(async () => {
    await Promise.allSettled([
      pickingProgressDB.clear(soId),
      soDetailsDB.clear(soId),
      errorQueueDB.clearForSO(soId),
      soListDB.clear(),
    ]);
    clearErrors(soId);
    clearActiveSO();
  }, [soId, clearErrors, clearActiveSO]);

  // ── Get SO row index from cached list ──────────────────────────────
const getSORowIndex = useCallback(async (): Promise<number | null> => {
  // First try from activeSO store — most reliable, set at picking start
  if (activeSO?.rowIndex) return activeSO.rowIndex;

  // Fallback to IndexedDB cache
  try {
    const cached = await soListDB.get();
    const row = cached?.data.find((s) => s.so === soId);
    return row?.rowIndex ?? null;
  } catch {
    return null;
  }
}, [soId, activeSO]);

  // ── Main submit handler ────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!isOnline) {
      toast.error("Internet connection required to submit.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const syncId = syncIdRef.current;

    try {
      // ── Step 1: Submit errors (if any) ──────────────────────────
      if (errors.length > 0) {
        const errorsPayload = errors.map((e) => ({
          so: e.soId,
          location: e.location,
          tag: e.tag,
          sku: e.sku,
          error: e.errorType,
          note: e.note,
        }));

        const errRes = await fetch("/api/sheets/submit-errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            syncId,
            soId,
            errors: errorsPayload,
          }),
        });

        if (!errRes.ok) {
          const json = await errRes.json().catch(() => ({}));
          throw new Error(
            json.error ?? `Failed to submit errors (${errRes.status})`
          );
        }

        // Mark all errors as synced in IndexedDB
        await Promise.all(
          errors.map((e) =>
            errorQueueDB.updateSyncStatus(e.id, SyncStatus.SUCCESS)
          )
        );
      }

      // ── Step 2: Update SO status ────────────────────────────────
      const rowIndex = await getSORowIndex();
      if (!rowIndex) {
        throw new Error(
          "Could not find SO row index. Please go back and retry."
        );
      }

      const finalStatus =
        errors.length > 0
          ? SOStatus.COMPLETED_WITH_ERRORS
          : SOStatus.COMPLETED;

      const statusRes = await fetch("/api/sheets/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex, status: finalStatus }),
      });

      if (!statusRes.ok) {
        const json = await statusRes.json().catch(() => ({}));
        throw new Error(
          json.error ?? `Failed to update SO status (${statusRes.status})`
        );
      }

      // ── Step 3: Clear all local data ────────────────────────────
      
      setIsSubmitted(true);
      toast.success("SO submitted successfully!");
      await clearLocalData();
   
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Submission failed. Please retry.";
      console.error("[useSubmit] Submit error:", message);
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isOnline, errors, soId, getSORowIndex, clearLocalData]);

  // ── Retry: reuse same syncId for idempotency ──────────────────────
  const handleRetry = useCallback(() => {
    setSubmitError(null);
    // syncIdRef stays the same — safe to retry
    handleSubmit();
  }, [handleSubmit]);

  return {
    soId,
    errors,
    isOnline,
    isSubmitting,
    isSubmitted,
    submitError,
    totalLocations,
    completedLocations,
    pickedCount,
    errorCount,
    canSubmit,
    handleSubmit,
    handleRetry,
  };
}