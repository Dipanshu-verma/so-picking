import { NextRequest, NextResponse } from "next/server";
import { updateSOStatus } from "@/lib/google-sheets";
import { SOStatus } from "@/constants";

interface UpdateStatusBody {
  rowIndex: number;
  status: string;
}

const ALLOWED_STATUSES = Object.values(SOStatus) as string[];

export async function PUT(req: NextRequest) {
  try {
    const body: UpdateStatusBody = await req.json();

    if (!body.rowIndex || typeof body.rowIndex !== "number") {
      return NextResponse.json(
        { success: false, error: "rowIndex (number) is required", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    await updateSOStatus(body.rowIndex, body.status as SOStatus);

    return NextResponse.json({
      success: true,
      data: { rowIndex: body.rowIndex, status: body.status },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update SO status";
    console.error("[API] /api/sheets/update-status error:", message);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

 