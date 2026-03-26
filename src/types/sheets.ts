import { SOStatus } from "@/constants";

// ─────────────────────────────────────────────
// Raw Google Sheets Row Types (string arrays)
// ─────────────────────────────────────────────
export type RawSheetRow = string[];

// ─────────────────────────────────────────────
// SO List Row (from SO_List sheet)
// ─────────────────────────────────────────────
export interface SOListRow {
  date: string;         // Column A
  so: string;           // Column B
  status: SOStatus;     // Column C
  scanSku: boolean;     // Column D (Yes/No → boolean)
  rowIndex: number;     // 1-based row index (for updates)
}

// ─────────────────────────────────────────────
// SO Details Row (from SO_Details sheet)
// ─────────────────────────────────────────────
export interface SODetailsRow {
  so: string;           // Column A
  tag: string;          // Column B
  sku: string;          // Column C
  location: string;     // Column D
  quantity: number;     // Column E
}

// ─────────────────────────────────────────────
// SKU Master Row (from SKU_Master sheet)
// ─────────────────────────────────────────────
export interface SKUMasterRow {
  sku: string;          // Column A
  name: string;         // Column B
}

// ─────────────────────────────────────────────
// Errors Row (written to Errors sheet)
// ─────────────────────────────────────────────
export interface ErrorRow {
  so: string;           // Column A
  location: string;     // Column B
  tag: string | null;   // Column C
  sku: string | null;   // Column D
  error: string;        // Column E (ErrorType enum value)
  note: string;         // Column F
}

// ─────────────────────────────────────────────
// API Response Wrappers
// ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface SOListResponse {
  soList: SOListRow[];
  fetchedAt: string;
}

export interface SODetailsResponse {
  soDetails: SODetailsRow[];
  fetchedAt: string;
}

export interface SKUMasterResponse {
  skuMaster: SKUMasterRow[];
  fetchedAt: string;
}

// ─────────────────────────────────────────────
// Cached Data (IndexedDB stored)
// ─────────────────────────────────────────────
export interface CachedSOList {
  id: "so_list";        // Singleton key
  data: SOListRow[];
  cachedAt: number;     // Unix timestamp
}

export interface CachedSODetails {
  id: string;           // soId as key
  soId: string;
  data: SODetailsRow[];
  cachedAt: number;
}

export interface CachedSKUMaster {
  id: "sku_master";     // Singleton key
  data: SKUMasterRow[];
  cachedAt: number;
}