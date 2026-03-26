import { NextResponse } from "next/server";
import { getSKUMaster } from "@/lib/google-sheets";

export async function GET() {
  try {
    const skuMaster = await getSKUMaster();
    return NextResponse.json({
      success: true,
      data: skuMaster,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch SKU master";
    console.error("[API] /api/sheets/sku-master error:", message);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

 