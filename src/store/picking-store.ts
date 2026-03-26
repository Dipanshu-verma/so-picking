import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { LocationStatus, PickingStep } from "@/constants";
import type { ActiveSO, LocationGroup, PickingProgress, PickingStats } from "@/types/picking";

interface PickingState {
  activeSO: ActiveSO | null;
  currentStep: PickingStep;
  scannedPallet: string | null;
  scannedSKU: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  lastSyncId: string | null;

  // Actions
  setActiveSO: (so: ActiveSO) => void;
  clearActiveSO: () => void;
  setCurrentStep: (step: PickingStep) => void;
  setScannedPallet: (value: string | null) => void;
  setScannedSKU: (value: string | null) => void;
  markLocationCompleted: (location: string) => void;
  markLocationError: (location: string) => void;
  moveToNextLocation: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmitError: (error: string | null) => void;
  setLastSyncId: (syncId: string | null) => void;
  getStats: () => PickingStats;
  getProgress: () => PickingProgress | null;
  isAllDone: () => boolean;
  resetScanState: () => void;
}

export const usePickingStore = create<PickingState>()(
  devtools(
     persist(
    (set, get) => ({
      activeSO: null,
      currentStep: PickingStep.PALLET_SCAN,
      scannedPallet: null,
      scannedSKU: null,
      isSubmitting: false,
      submitError: null,
      lastSyncId: null,

      setActiveSO: (so) =>
        set({ activeSO: so, currentStep: PickingStep.PALLET_SCAN }),

      clearActiveSO: () =>
        set({
          activeSO: null,
          currentStep: PickingStep.PALLET_SCAN,
          scannedPallet: null,
          scannedSKU: null,
          submitError: null,
        }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setScannedPallet: (value) => set({ scannedPallet: value }),

      setScannedSKU: (value) => set({ scannedSKU: value }),

      markLocationCompleted: (location) => {
        const { activeSO } = get();
        if (!activeSO) return;

        const updatedLocations = activeSO.locations.map((loc) =>
          loc.location === location
            ? { ...loc, status: LocationStatus.COMPLETED }
            : loc
        );

        const completedCount = updatedLocations.filter(
          (l) => l.status === LocationStatus.COMPLETED || l.status === LocationStatus.ERROR
        ).length;

        set({
          activeSO: {
            ...activeSO,
            locations: updatedLocations,
            completedLocations: completedCount,
          },
        });
      },

      markLocationError: (location) => {
        const { activeSO } = get();
        if (!activeSO) return;

        const updatedLocations = activeSO.locations.map((loc) =>
          loc.location === location
            ? { ...loc, status: LocationStatus.ERROR }
            : loc
        );

        const completedCount = updatedLocations.filter(
          (l) => l.status === LocationStatus.COMPLETED || l.status === LocationStatus.ERROR
        ).length;

        set({
          activeSO: {
            ...activeSO,
            locations: updatedLocations,
            completedLocations: completedCount,
          },
        });
      },

      moveToNextLocation: () => {
        const { activeSO } = get();
        if (!activeSO) return;

        const nextIndex = activeSO.currentLocationIndex + 1;
        if (nextIndex < activeSO.totalLocations) {
          set({
            activeSO: { ...activeSO, currentLocationIndex: nextIndex },
            currentStep: PickingStep.PALLET_SCAN,
            scannedPallet: null,
            scannedSKU: null,
          });
        } else {
          set({ currentStep: PickingStep.DONE });
        }
      },

      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setSubmitError: (error) => set({ submitError: error }),
      setLastSyncId: (syncId) => set({ lastSyncId: syncId }),

      getStats: (): PickingStats => {
        const { activeSO } = get();
        if (!activeSO) return { total: 0, completed: 0, errors: 0, pending: 0, progressPercent: 0 };

        const total = activeSO.totalLocations;
        const completed = activeSO.locations.filter(
          (l) => l.status === LocationStatus.COMPLETED
        ).length;
        const errors = activeSO.locations.filter(
          (l) => l.status === LocationStatus.ERROR
        ).length;
        const pending = total - completed - errors;
        const progressPercent = total > 0 ? Math.round(((completed + errors) / total) * 100) : 0;

        return { total, completed, errors, pending, progressPercent };
      },

      getProgress: (): PickingProgress | null => {
        const { activeSO, currentStep } = get();
        if (!activeSO) return null;

        const locationStatuses = activeSO.locations.reduce(
          (acc, loc) => ({ ...acc, [loc.location]: loc.status }),
          {} as Record<string, LocationStatus>
        );

        return {
          id: activeSO.soId,
          soId: activeSO.soId,
          currentLocationIndex: activeSO.currentLocationIndex,
          currentStep,
          locationStatuses,
          lastUpdatedAt: Date.now(),
        };
      },

      isAllDone: (): boolean => {
        const { activeSO } = get();
        if (!activeSO) return false;
        return activeSO.locations.every(
          (l) => l.status === LocationStatus.COMPLETED || l.status === LocationStatus.ERROR
        );
      },

      resetScanState: () =>
        set({
          scannedPallet: null,
          scannedSKU: null,
          currentStep: PickingStep.PALLET_SCAN,
        }),
    }),
    { name: "picking-store" } // persist key in localStorage
    ),
    { name: "PickingStore" }   // devtools label
  )
);