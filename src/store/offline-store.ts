import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SyncStatus } from "@/constants";
import type { PickingError } from "@/types/errors";

interface OfflineState {
  pendingErrors: PickingError[];
  syncStatus: SyncStatus;
  lastSyncAt: number | null;
  syncError: string | null;
  retryCount: number;

  // Actions
  addError: (error: PickingError) => void;
  removeError: (id: string) => void;
  clearErrors: (soId: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncAt: (timestamp: number) => void;
  setSyncError: (error: string | null) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  getErrorsForSO: (soId: string) => PickingError[];
}

export const useOfflineStore = create<OfflineState>()(
  devtools(
    (set, get) => ({
      pendingErrors: [],
      syncStatus: SyncStatus.PENDING,
      lastSyncAt: null,
      syncError: null,
      retryCount: 0,

      addError: (error) =>
        set((state) => ({
          pendingErrors: [...state.pendingErrors, error],
        })),

      removeError: (id) =>
        set((state) => ({
          pendingErrors: state.pendingErrors.filter((e) => e.id !== id),
        })),

      clearErrors: (soId) =>
        set((state) => ({
          pendingErrors: state.pendingErrors.filter((e) => e.soId !== soId),
        })),

      setSyncStatus: (syncStatus) => set({ syncStatus }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      setSyncError: (syncError) => set({ syncError }),
      incrementRetry: () =>
        set((state) => ({ retryCount: state.retryCount + 1 })),
      resetRetry: () => set({ retryCount: 0 }),

      getErrorsForSO: (soId) => {
        return get().pendingErrors.filter((e) => e.soId === soId);
      },
    }),
    { name: "OfflineStore" }
  )
);