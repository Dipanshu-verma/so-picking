"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePickingStore } from "@/store/picking-store";
import { useOfflineStore } from "@/store/offline-store";
import { pickingProgressDB, errorQueueDB } from "@/lib/offline-db";
import { ErrorType, PickingStep, SyncStatus } from "@/constants";
import { compareBarcode } from "@/lib/barcode";
import { playSound, vibrate } from "@/lib/utils";
import type { PickingError, ErrorQueueItem } from "@/types/errors";
import type { LocationGroup, PickingStats } from "@/types/picking";

export type FlashType = "success" | "error" | null;

interface UsePickingFlowReturn {
  currentLocation: LocationGroup | null;
  currentStep: PickingStep;
  isAllDone: boolean;
  flashType: FlashType;
  // Pallet
  palletMismatchVisible: boolean;
  handlePalletScan: (value: string) => void;
  handlePalletMismatchRetry: () => void;
  handlePalletMismatchError: () => void;
  // SKU
  scannedSKU: string | null;
  isSKUValid: boolean;
  handleSKUScan: (value: string) => void;
  handlePicked: () => Promise<void>;
  // Error
  errorModalVisible: boolean;
  errorPreselected: ErrorType | undefined;
  handleOpenError: () => void;
  handleErrorSubmit: (type: ErrorType, note: string) => Promise<void>;
  handleErrorModalClose: () => void;
  // Stats
  stats: PickingStats;
}

export function usePickingFlow(): UsePickingFlowReturn {
  const {
    activeSO,
    currentStep,
    scannedSKU,
    setCurrentStep,
    setScannedSKU,
    markLocationCompleted,
    markLocationError,
    moveToNextLocation,
    getStats,
    isAllDone,
    resetScanState,
    getProgress,
  } = usePickingStore();

  const { addError } = useOfflineStore();

  const [palletMismatchVisible, setPalletMismatchVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorPreselected, setErrorPreselected] = useState<ErrorType | undefined>(undefined);
  const [flashType, setFlashType] = useState<FlashType>(null);

  // Flash the screen for 600ms then clear
  const triggerFlash = useCallback((type: "success" | "error") => {
    setFlashType(type);
    setTimeout(() => setFlashType(null), 600);
  }, []);

  const currentLocation: LocationGroup | null =
    activeSO && activeSO.currentLocationIndex < activeSO.locations.length
      ? activeSO.locations[activeSO.currentLocationIndex]
      : null;

  const allDone = isAllDone();
  const stats = getStats();

  const isSKUValid =
    scannedSKU !== null && currentLocation !== null
      ? compareBarcode(scannedSKU, currentLocation.sku)
      : false;

  const saveProgress = useCallback(async () => {
    const progress = getProgress();
    if (!progress) return;
    await pickingProgressDB.save(progress).catch((e) => {
      console.error("[usePickingFlow] IndexedDB save failed:", e);
    });
  }, [getProgress]);

  // ── PALLET SCAN ───────────────────────────────────────────────────
  const handlePalletScan = useCallback(
    (value: string) => {
      if (!currentLocation) return;
      const isMatch = compareBarcode(value, currentLocation.tag);
      if (isMatch) {
        playSound("success");
        vibrate(100);               // Short single vibration — correct scan
        triggerFlash("success");    // Green flash
        setCurrentStep(PickingStep.SKU_SCREEN);
      } else {
        playSound("error");
        vibrate([200, 100, 200]);   // Triple long vibration — wrong scan
        triggerFlash("error");      // Red flash
        setPalletMismatchVisible(true);
      }
    },
    [currentLocation, setCurrentStep, triggerFlash]
  );

  const handlePalletMismatchRetry = useCallback(() => {
    setPalletMismatchVisible(false);
    resetScanState();
  }, [resetScanState]);

  const handlePalletMismatchError = useCallback(() => {
    setPalletMismatchVisible(false);
    setErrorPreselected(ErrorType.PALLET_MISMATCH);
    setErrorModalVisible(true);
  }, []);

  // ── SKU SCAN ──────────────────────────────────────────────────────
  const handleSKUScan = useCallback(
    (value: string) => {
      if (!currentLocation) return;
      const isMatch = compareBarcode(value, currentLocation.sku);
      if (isMatch) {
        playSound("success");
        vibrate(100);               // Short single vibration — correct scan
        triggerFlash("success");    // Green flash
        setScannedSKU(value);
      } else {
        playSound("error");
        vibrate([200, 100, 200]);   // Triple long vibration — wrong scan
        triggerFlash("error");      // Red flash
        setScannedSKU(null);
      }
    },
    [currentLocation, setScannedSKU, triggerFlash]
  );

  // ── PICKED ────────────────────────────────────────────────────────
  const handlePicked = useCallback(async () => {
    if (!currentLocation || !activeSO) return;
    markLocationCompleted(currentLocation.location);
    playSound("chime");             // Success chime — location complete
    vibrate(200);                   // Single long vibration — location done
    triggerFlash("success");
    await saveProgress();
    moveToNextLocation();
  }, [currentLocation, activeSO, markLocationCompleted, saveProgress, moveToNextLocation, triggerFlash]);

  // ── ERROR FLOW ────────────────────────────────────────────────────
  const handleOpenError = useCallback(() => {
    setErrorPreselected(undefined);
    setErrorModalVisible(true);
  }, []);

  const handleErrorModalClose = useCallback(() => {
    setErrorModalVisible(false);
    setErrorPreselected(undefined);
  }, []);

  const handleErrorSubmit = useCallback(
    async (type: ErrorType, note: string) => {
      if (!currentLocation || !activeSO) return;

      const error: PickingError = {
        id: uuidv4(),
        soId: activeSO.soId,
        location: currentLocation.location,
        tag: currentLocation.tag ?? null,
        sku: currentLocation.sku ?? null,
        errorType: type,
        note,
        capturedAt: Date.now(),
        syncStatus: SyncStatus.PENDING,
      };

      addError(error);

      const queueItem: ErrorQueueItem = {
        id: error.id,
        soId: activeSO.soId,
        error,
        createdAt: Date.now(),
        syncStatus: SyncStatus.PENDING,
        retryCount: 0,
      };

      await errorQueueDB.add(queueItem).catch((e) => {
        console.error("[usePickingFlow] Failed to save error to IndexedDB:", e);
      });

      markLocationError(currentLocation.location);
      playSound("error");
      vibrate([200, 100, 200]);     // Triple vibration — error submitted
      triggerFlash("error");

      setErrorModalVisible(false);
      setErrorPreselected(undefined);

      await saveProgress();
      moveToNextLocation();
    },
    [currentLocation, activeSO, addError, markLocationError, saveProgress, moveToNextLocation, triggerFlash]
  );

  return {
    currentLocation,
    currentStep,
    isAllDone: allDone,
    flashType,
    palletMismatchVisible,
    handlePalletScan,
    handlePalletMismatchRetry,
    handlePalletMismatchError,
    scannedSKU,
    isSKUValid,
    handleSKUScan,
    handlePicked,
    errorModalVisible,
    errorPreselected,
    handleOpenError,
    handleErrorSubmit,
    handleErrorModalClose,
    stats,
  };
}