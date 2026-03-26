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
  // PICKED is only enabled when: SKU scan not required, OR SKU has been validated
  const pickedEnabled = !scanSkuRequired || isSKUValid;

  return (
    <div className="space-y-5">
      {/* Location breadcrumb + pallet confirmed badge */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-semibold text-gray-700">{location.location}</span>
        <span>·</span>
        <span>{locationIndex + 1} of {totalLocations}</span>
        <span className="ml-auto px-2.5 py-0.5 rounded-full bg-green-100 text-green-700
                         text-xs font-bold border border-green-200">
          Pallet ✓
        </span>
      </div>

      {/* SKU detail card */}
      <div className="warehouse-card space-y-4">
        {/* SKU Name */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-orange-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              SKU Name
            </p>
            <p className="text-lg font-bold text-gray-900 leading-snug">
              {location.skuName}
            </p>
          </div>
        </div>

        {/* SKU code + Quantity */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <Hash className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">SKU Code</p>
              <p className="text-base font-mono font-bold text-gray-800">{location.sku}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Layers className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Quantity</p>
              <p className="text-3xl font-black text-gray-900 leading-tight">
                {location.quantity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional SKU scanner */}
      {scanSkuRequired && (
        <SKUScanner
          expectedSKU={location.sku}
          onScan={onSKUScan}
          isValid={isSKUValid}
        />
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onError}
          aria-label="Report error for this location"
          className="warehouse-button-danger flex items-center justify-center gap-2"
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
          className="warehouse-button-success flex items-center justify-center gap-2
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          PICKED
        </button>
      </div>

      {scanSkuRequired && !isSKUValid && (
        <p className="text-center text-xs text-gray-400">
          Scan SKU barcode above to enable PICKED
        </p>
      )}
    </div>
  );
}