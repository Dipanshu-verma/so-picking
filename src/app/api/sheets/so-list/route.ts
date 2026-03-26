import { NextRequest, NextResponse } from "next/server";
import { getSOList } from "@/lib/google-sheets";
import { SOStatus } from "@/constants";
import type { SOListRow } from "@/types/sheets";


export async function GET(req: NextRequest) {
  try {
    const soId = req.nextUrl.searchParams.get("soId");

    // If soId provided — return that specific SO with its real current status
    if (soId) {
      const row = await getSORow(soId.trim());
      return NextResponse.json({
        success: true,
        data: row ? [row] : [],
        timestamp: new Date().toISOString(),
      });
    }

    // Otherwise return only PENDING list as normal
    const soList = await getSOList();
    return NextResponse.json({
      success: true,
      data: soList,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch SO list";
    console.error("[API] /api/sheets/so-list error:", message);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// Separate function to get a single SO row regardless of status
async function getSORow(soId: string): Promise<SOListRow | null> {
  const { google } = await import("googleapis");
  const { SHEET_NAMES } = await import("@/constants");
  const { withRetry } = await import("@/lib/utils");

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

  const VALID_STATUSES = new Set<string>(Object.values(SOStatus));

  const response = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.SO_LIST}!A2:D`,
    })
  );

  const rows = ((response.data.values ?? []) as string[][]).filter((row) =>
    row.some((cell) => cell?.trim())
  );

  const allRows: SOListRow[] = rows.map((row, index) => ({
    date: row[0]?.trim() ?? "",
    so: row[1]?.trim() ?? "",
    status: (VALID_STATUSES.has(row[2]?.trim().toUpperCase())
      ? row[2].trim().toUpperCase()
      : SOStatus.PENDING) as SOStatus,
    scanSku: row[3]?.trim().toLowerCase() === "yes",
    rowIndex: index + 2,
  }));

  return allRows.find((r) => r.so === soId) ?? null;
}
 