"use client";

import { CheckCircle2, XCircle, Package, Hash, Layers } from "lucide-react";
import { SKUScanner } from "@/components/picking/SKUScanner";
import type { LocationGroup } from "@/types/picking";

interface SKUScreenProps {
  location: LocationGroup;
  locationIndex: number;
  totalLocations: number;
  scanSkuRequired: boolean;
  scannedSKU: string | null;
  isSKUValid: boolean;
  onSKUScan: (value: string) => void;
  onPicked: () => void;
  onError: () => void;
}

export function SKUScreen({
  location,
  locationIndex,
  totalLocations,
  scanSkuRequired,
  scannedSKU,
  isSKUValid,
  onSKUScan,
  onPicked,
  onError,
}: SKUScreenProps) {
  const pickedEnabled = !scanSkuRequired || isSKUValid;

  return (
    <div className="space-y-5">
      {/* ── Location breadcrumb + pallet confirmed badge ─────── */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-bold text-slate-700">{location.location}</span>
        <span className="text-slate-300">·</span>
        <span>{locationIndex + 1} of {totalLocations}</span>
        <span
          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                     text-xs font-bold text-green-700 border border-green-200"
          style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          Pallet ✓
        </span>
      </div>

      {/* ── SKU detail card ─────────────────────────────────── */}
      <div className="warehouse-card space-y-4">
        {/* SKU Name */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
              border: "1px solid #fdba74",
            }}
          >
            <Package className="w-6 h-6 text-orange-500" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              SKU Name
            </p>
            <p className="text-xl font-black text-slate-900 leading-snug mt-0.5">
              {location.skuName}
            </p>
          </div>
        </div>

        {/* SKU code + Quantity row */}
        <div
          className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 rounded-2xl"
        >
          <div
            className="flex flex-col gap-1 px-4 py-3 rounded-xl"
            style={{ background: "#f8fafc" }}
          >
            <div className="flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">SKU Code</p>
            </div>
            <p className="text-base font-mono font-black text-slate-800">{location.sku}</p>
          </div>

          <div
            className="flex flex-col gap-1 px-4 py-3 rounded-xl"
            style={{ background: "#f8fafc" }}
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Quantity</p>
            </div>
            <p className="text-4xl font-black text-slate-900 leading-tight tabular-nums">
              {location.quantity}
            </p>
          </div>
        </div>
      </div>

      {/* ── Conditional SKU scanner ──────────────────────────── */}
      {scanSkuRequired && (
        <SKUScanner
          expectedSKU={location.sku}
          onScan={onSKUScan}
          isValid={isSKUValid}
        />
      )}

      {/* ── Action buttons ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onError}
          aria-label="Report error for this location"
          className="warehouse-button warehouse-button-danger flex items-center justify-center gap-2"
        >
          <XCircle className="w-5 h-5" aria-hidden="true" />
          ERROR
        </button>

        <button
          onClick={onPicked}
          disabled={!pickedEnabled}
          aria-label={
            pickedEnabled ? "Mark as picked" : "Scan SKU barcode first to enable"
          }
          className="warehouse-button warehouse-button-success flex items-center justify-center gap-2
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          PICKED
        </button>
      </div>

      {scanSkuRequired && !isSKUValid && (
        <p className="text-center text-xs text-slate-400 font-medium">
          Scan SKU barcode above to enable PICKED
        </p>
      )}
    </div>
  );
}