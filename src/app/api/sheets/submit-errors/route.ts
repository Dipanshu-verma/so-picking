import { NextRequest, NextResponse } from "next/server";
import { submitErrors } from "@/lib/google-sheets";
import type { ErrorRow } from "@/types/sheets";

interface SubmitErrorsBody {
  syncId: string;
  soId: string;
  errors: ErrorRow[];
}

export async function POST(req: NextRequest) {
  try {
    const body: SubmitErrorsBody = await req.json();

    if (!body.syncId?.trim()) {
      return NextResponse.json(
        { success: false, error: "syncId is required", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    if (!body.soId?.trim()) {
      return NextResponse.json(
        { success: false, error: "soId is required", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.errors)) {
      return NextResponse.json(
        { success: false, error: "errors must be an array", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    await submitErrors(body.errors);
 

    return NextResponse.json({
      success: true,
      data: {
        syncId: body.syncId,
        soId: body.soId,
        errorsSubmitted: body.errors.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit errors";
    console.error("[API] /api/sheets/submit-errors error:", message);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}