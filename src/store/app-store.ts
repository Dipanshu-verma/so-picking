import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  globalError: string | null;
  isSyncing: boolean;
  pendingSyncCount: number;
  // Actions
  setOnline: (isOnline: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  setSyncing: (isSyncing: boolean) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      isOnline: true,
      isLoading: false,
      globalError: null,
      isSyncing: false,
      pendingSyncCount: 0,

      setOnline: (isOnline) => set({ isOnline }),
      setLoading: (isLoading) => set({ isLoading }),
      setGlobalError: (globalError) => set({ globalError }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
    }),
    { name: "AppStore" }
  )
);