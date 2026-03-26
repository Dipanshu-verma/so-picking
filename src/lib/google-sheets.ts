import { google, sheets_v4 } from "googleapis";
import { SOStatus, SHEET_NAMES, ErrorType } from "@/constants";
import type { SOListRow, SODetailsRow, SKUMasterRow, ErrorRow } from "@/types/sheets";
import { withRetry } from "@/lib/utils";

// ─────────────────────────────────────────────
// Auth — Google Service Account
// ─────────────────────────────────────────────
function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error("Missing Google Service Account credentials in environment variables");
  }

  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient(): sheets_v4.Sheets {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SPREADSHEET_ID in environment variables");
  return id;
}

// ─────────────────────────────────────────────
// Parse Helper
// ─────────────────────────────────────────────
function parseRows(rows: string[][]): string[][] {
  return rows.filter((row) => row.some((cell) => cell?.trim()));
}


const VALID_STATUSES = new Set<string>(Object.values(SOStatus));
const VALID_ERROR_TYPES = new Set<string>(Object.values(ErrorType));

function validateStatus(value: string): SOStatus {
  const trimmed = value?.trim().toUpperCase();
  if (VALID_STATUSES.has(trimmed)) return trimmed as SOStatus;
  console.warn(`[Sheets] Invalid status value: "${value}" — defaulting to PENDING`);
  return SOStatus.PENDING;
}

function validateErrorType(value: string): string {
  const trimmed = value?.trim();
  if (VALID_ERROR_TYPES.has(trimmed)) return trimmed;
  console.warn(`[Sheets] Invalid error type: "${value}" — keeping as-is`);
  return trimmed;
}

// ─────────────────────────────────────────────
// getSOList — Fetch all PENDING SOs sorted by date
// ─────────────────────────────────────────────
export async function getSOList(): Promise<SOListRow[]> {
  return withRetry(async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.SO_LIST}!A2:D`, // Skip header row
    });

    const rows = parseRows((response.data.values ?? []) as string[][]);

  const soList: SOListRow[] = rows.map((row, index) => ({
  date: row[0]?.trim() ?? "",
  so: row[1]?.trim() ?? "",
  status: validateStatus(row[2] ?? ""),         
  scanSku: row[3]?.trim().toLowerCase() === "yes",
  rowIndex: index + 2,
}));

    // Filter PENDING and sort by date ascending
    return soList
      .filter((so) => so.status === SOStatus.PENDING)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });
}

// ─────────────────────────────────────────────
// getSODetails — Fetch details for specific SO
// ─────────────────────────────────────────────
export async function getSODetails(soId: string): Promise<SODetailsRow[]> {
  return withRetry(async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.SO_DETAILS}!A2:E`,
    });

    const rows = parseRows((response.data.values ?? []) as string[][]);

   return rows
  .filter((row) => row[0]?.trim() === soId)
  .map((row) => ({
    so: row[0]?.trim() ?? "",
    tag: row[1]?.trim() ?? "",
    sku: row[2]?.trim() ?? "",
    location: row[3]?.trim() ?? "",
    quantity: Math.max(0, parseInt(row[4] ?? "0", 10) || 0), // ← never negative/NaN
  }));
  });
}

// ─────────────────────────────────────────────
// getSKUMaster — Fetch full SKU master
// ─────────────────────────────────────────────
export async function getSKUMaster(): Promise<SKUMasterRow[]> {
  return withRetry(async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.SKU_MASTER}!A2:B`,
    });

    const rows = parseRows((response.data.values ?? []) as string[][]);

    return rows.map((row) => ({
      sku: row[0] ?? "",
      name: row[1] ?? "",
    }));
  });
}

// ─────────────────────────────────────────────
// updateSOStatus — Update status column of an SO
// ─────────────────────────────────────────────
export async function updateSOStatus(
  rowIndex: number,
  status: SOStatus
): Promise<void> {
  return withRetry(async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAMES.SO_LIST}!C${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });
  });
}

// ─────────────────────────────────────────────
// submitErrors — Batch append errors to Errors sheet
// ─────────────────────────────────────────────
export async function submitErrors(errors: ErrorRow[]): Promise<void> {
  if (errors.length === 0) return;

  return withRetry(async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

  const rows = errors.map((e) => [
  e.so?.trim() ?? "",
  e.location?.trim() ?? "",
  e.tag?.trim() ?? "",
  e.sku?.trim() ?? "",
  validateErrorType(e.error),   
  e.note?.trim() ?? "",
]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAMES.ERRORS}!A:F`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: rows,
      },
    });
  });
}

// ─────────────────────────────────────────────
// checkSyncIdExists — Idempotency check
// Used to prevent duplicate submissions
// ─────────────────────────────────────────────
export async function checkSyncIdExists(syncId: string): Promise<boolean> {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    // We store syncId in a dedicated SyncLog sheet (col A = syncId, col B = timestamp)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `SyncLog!A:A`,
    });

    const rows = (response.data.values ?? []) as string[][];
    return rows.some((row) => row[0] === syncId);
  } catch {
    // If SyncLog sheet doesn't exist, return false (first time)
    return false;
  }
}

// ─────────────────────────────────────────────
// recordSyncId — Write syncId to SyncLog sheet
// ─────────────────────────────────────────────
export async function recordSyncId(syncId: string): Promise<void> {
  return withRetry(async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `SyncLog!A:B`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[syncId, new Date().toISOString()]],
      },
    });
  });
}