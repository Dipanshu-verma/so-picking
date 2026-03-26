import { NextRequest, NextResponse } from "next/server";
import { getSODetails } from "@/lib/google-sheets";

export async function GET(req: NextRequest) {
  try {
    const soId = req.nextUrl.searchParams.get("soId");
    if (!soId || !soId.trim()) {
      return NextResponse.json(
        { success: false, error: "soId query param is required", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const soDetails = await getSODetails(soId.trim());

    if (soDetails.length === 0) {
      return NextResponse.json(
        { success: false, error: `No details found for SO: ${soId}`, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: soDetails,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch SO details";
    console.error("[API] /api/sheets/so-details error:", message);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

