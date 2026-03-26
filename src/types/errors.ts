import { ErrorType, SyncStatus } from "@/constants";

// ─────────────────────────────────────────────
// A single picking error captured during flow
// ─────────────────────────────────────────────
export interface PickingError {
  id: string;               // UUID
  soId: string;
  location: string;
  tag: string | null;       // Pallet tag (null if not scanned)
  sku: string | null;       // SKU (null if error before SKU screen)
  errorType: ErrorType;
  note: string;
  capturedAt: number;       // Unix timestamp
  syncStatus: SyncStatus;
}

// ─────────────────────────────────────────────
// Error Queue item (stored in IndexedDB)
// ─────────────────────────────────────────────
export interface ErrorQueueItem {
  id: string;               // UUID (same as PickingError.id)
  soId: string;
  error: PickingError;
  createdAt: number;
  syncStatus: SyncStatus;
  retryCount: number;
  lastAttemptAt?: number;
  syncId?: string;          // Set when submitting (idempotency)
}

// ─────────────────────────────────────────────
// Sync Queue item (for all pending Google Sheet writes)
// ─────────────────────────────────────────────
export interface SyncQueueItem {
  id: string;               // UUID
  type: SyncOperationType;
  payload: SyncPayload;
  createdAt: number;
  syncStatus: SyncStatus;
  retryCount: number;
  lastAttemptAt?: number;
  syncId: string;           // Idempotency key
}

export enum SyncOperationType {
  UPDATE_SO_STATUS = "UPDATE_SO_STATUS",
  SUBMIT_ERRORS = "SUBMIT_ERRORS",
}

export type SyncPayload =
  | UpdateSOStatusPayload
  | SubmitErrorsPayload;

export interface UpdateSOStatusPayload {
  type: SyncOperationType.UPDATE_SO_STATUS;
  soId: string;
  status: string;
  rowIndex: number;
}

export interface SubmitErrorsPayload {
  type: SyncOperationType.SUBMIT_ERRORS;
  soId: string;
  errors: Array<{
    so: string;
    location: string;
    tag: string | null;
    sku: string | null;
    error: string;
    note: string;
  }>;
}

// ─────────────────────────────────────────────
// Error modal state
// ─────────────────────────────────────────────
export interface ErrorModalState {
  isOpen: boolean;
  soId: string;
  location: string;
  tag: string | null;
  sku: string | null;
  preSelectedType?: ErrorType;
}