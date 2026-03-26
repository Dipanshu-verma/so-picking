import { LocationStatus, PickingStep } from "@/constants";
import { SODetailsRow, SKUMasterRow } from "./sheets";

// ─────────────────────────────────────────────
// Location with aggregated picking info
// ─────────────────────────────────────────────
export interface LocationGroup {
  location: string;
  tag: string;           // Expected pallet TAG
  sku: string;
  skuName: string;       // From SKU_Master join
  quantity: number;
  status: LocationStatus;
}

// ─────────────────────────────────────────────
// Active SO being picked
// ─────────────────────────────────────────────
export interface ActiveSO {
  soId: string;
  date: string;
  scanSku: boolean;
   rowIndex: number;  
  locations: LocationGroup[];
  totalLocations: number;
  completedLocations: number;
  currentLocationIndex: number;
}

// ─────────────────────────────────────────────
// Picking Progress (persisted in IndexedDB)
// ─────────────────────────────────────────────
export interface PickingProgress {
  id: string;                       // soId
  soId: string;
  currentLocationIndex: number;
  currentStep: PickingStep;
  locationStatuses: Record<string, LocationStatus>; // location → status
  completedAt?: number;
  lastUpdatedAt: number;
}

// ─────────────────────────────────────────────
// Pallet Scan Result
// ─────────────────────────────────────────────
export interface PalletScanResult {
  scanned: string;
  expected: string;
  isMatch: boolean;
}

// ─────────────────────────────────────────────
// SKU Scan Result
// ─────────────────────────────────────────────
export interface SKUScanResult {
  scanned: string;
  expected: string;
  isMatch: boolean;
}

// ─────────────────────────────────────────────
// Picking Session (full session state)
// ─────────────────────────────────────────────
export interface PickingSession {
  sessionId: string;          // UUID for idempotency
  soId: string;
  startedAt: number;
  locations: LocationGroup[];
  progress: PickingProgress;
  isOffline: boolean;
}

// ─────────────────────────────────────────────
// Submission Payload
// ─────────────────────────────────────────────
export interface SubmissionPayload {
  syncId: string;               // Idempotency key
  soId: string;
  sessionId: string;
  errors: PickingError[];
  completedAt: number;
}

// ─────────────────────────────────────────────
// Location stats for progress display
// ─────────────────────────────────────────────
export interface PickingStats {
  total: number;
  completed: number;
  errors: number;
  pending: number;
  progressPercent: number;
}

// Re-export for convenience
export type { SODetailsRow, SKUMasterRow };

// Import from errors type
import type { PickingError } from "./errors";