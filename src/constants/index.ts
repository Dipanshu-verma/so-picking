// ─────────────────────────────────────────────
// SO Status Enum
// ─────────────────────────────────────────────
export enum SOStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  COMPLETED_WITH_ERRORS = "COMPLETED_WITH_ERRORS",
  IGNORED = "IGNORED",
}

// ─────────────────────────────────────────────
// Error Types Enum
// ─────────────────────────────────────────────
export enum ErrorType {
  PALLET_NOT_FOUND = "Pallet Not Found",
  PALLET_MISMATCH = "Pallet Mismatch",
  PALLET_EMPTY = "Pallet Empty",
  SKU_SHORT = "SKU Short",
  SKU_MISMATCH = "SKU Mismatch",
}

// ─────────────────────────────────────────────
// Location Picking Status
// ─────────────────────────────────────────────
export enum LocationStatus {
  PENDING = "PENDING",
  PALLET_SCANNED = "PALLET_SCANNED",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

// ─────────────────────────────────────────────
// Picking Step
// ─────────────────────────────────────────────
export enum PickingStep {
  PALLET_SCAN = "PALLET_SCAN",
  SKU_SCREEN = "SKU_SCREEN",
  DONE = "DONE",
}

// ─────────────────────────────────────────────
// Sync Status
// ─────────────────────────────────────────────
export enum SyncStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

// ─────────────────────────────────────────────
// Barcode Scanner Config
// ─────────────────────────────────────────────
export const BARCODE_CONFIG = {
  HARDWARE_SCAN_THRESHOLD_MS: 50, // Keystrokes faster than this = hardware scanner
  MIN_BARCODE_LENGTH: 3,
  DEBOUNCE_MS: 300,
} as const;

// ─────────────────────────────────────────────
// API Config
// ─────────────────────────────────────────────
export const API_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY_MS: 1000,
  RETRY_MAX_DELAY_MS: 8000,
  SHEETS_RATE_LIMIT_REQUESTS: 100,
  SHEETS_RATE_LIMIT_WINDOW_MS: 100_000,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ─────────────────────────────────────────────
// IndexedDB Table Names
// ─────────────────────────────────────────────
export const DB_TABLES = {
  SO_LIST: "soList",
  SO_DETAILS: "soDetails",
  SKU_MASTER: "skuMaster",
  PICKING_PROGRESS: "pickingProgress",
  ERROR_QUEUE: "errorQueue",
  SYNC_QUEUE: "syncQueue",
} as const;

// ─────────────────────────────────────────────
// Sheet Names (from env or defaults)
// ─────────────────────────────────────────────
export const SHEET_NAMES = {
  SO_LIST: process.env.SHEET_SO_LIST ?? "SO_List",
  SO_DETAILS: process.env.SHEET_SO_DETAILS ?? "SO_Details",
  SKU_MASTER: process.env.SHEET_SKU_MASTER ?? "SKU_Master",
  ERRORS: process.env.SHEET_ERRORS ?? "Errors",
} as const;

// ─────────────────────────────────────────────
// Status Badge Colors
// ─────────────────────────────────────────────
export const STATUS_COLORS: Record<SOStatus, string> = {
  [SOStatus.PENDING]: "bg-gray-100 text-gray-700 border-gray-200",
  [SOStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700 border-blue-200",
  [SOStatus.COMPLETED]: "bg-green-100 text-green-700 border-green-200",
  [SOStatus.COMPLETED_WITH_ERRORS]: "bg-orange-100 text-orange-700 border-orange-200",
  [SOStatus.IGNORED]: "bg-red-100 text-red-700 border-red-200",
};

// ─────────────────────────────────────────────
// Toast Durations
// ─────────────────────────────────────────────
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

// ─────────────────────────────────────────────
// Sound Config
// ─────────────────────────────────────────────
export const SOUND_CONFIG = {
  SUCCESS_FREQUENCY: 880,
  ERROR_FREQUENCY: 220,
  DURATION_MS: 150,
} as const;

// ─────────────────────────────────────────────
// App Meta
// ─────────────────────────────────────────────
export const APP_META = {
  NAME: "SO Picking App",
  SHORT_NAME: "SO Pick",
  DESCRIPTION: "Warehouse Sales Order Picking Application",
  THEME_COLOR: "#2563eb",
  BACKGROUND_COLOR: "#f8fafc",
} as const;