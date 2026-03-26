"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Scan, Camera, CameraOff, MapPin, Package } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import type { LocationGroup } from "@/types/picking";

// Dynamic import — html5-qrcode uses browser APIs, must be client-only
const CameraScanner = dynamic(
  () =>
    import("@/components/picking/CameraScanner").then((m) => ({
      default: m.CameraScanner,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-sm text-gray-400">Starting camera...</p>
      </div>
    ),
  }
);

interface PalletScannerProps {
  location: LocationGroup;
  locationIndex: number;
  totalLocations: number;
  onScan: (value: string) => void;
}

export function PalletScanner({
  location,
  locationIndex,
  totalLocations,
  onScan,
}: PalletScannerProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { inputRef } = useBarcodeScanner({
    onScan: (value) => {
      setInputValue("");
      onScan(value);
    },
    enabled: !cameraOpen,
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim().toUpperCase();
    if (val.length >= 3) {
      setInputValue("");
      onScan(val);
    }
  };

  return (
    <div className="space-y-5">
      {/* Location info card */}
      <div className="warehouse-card bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
              Location {locationIndex + 1} of {totalLocations}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5 truncate">
              {location.location}
            </p>
          </div>
        </div>

        {/* SKU hint */}
        <div className="mt-4 pt-4 border-t border-blue-200 flex items-center gap-3">
          <Package className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">
              {location.skuName}
            </p>
            <p className="text-xs font-mono text-gray-400">
              {location.sku} · Qty: {location.quantity}
            </p>
          </div>
        </div>
      </div>

      {/* Scan instruction */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Scan className="w-8 h-8 text-gray-500" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Scan Pallet</h2>
        <p className="text-sm text-gray-500 mt-1">
          Scan the pallet barcode at{" "}
          <strong className="text-gray-700">{location.location}</strong>
        </p>
      </div>

      {/* Camera scanner (lazy loaded) */}
      {cameraOpen && (
        <CameraScanner
          onScan={(value) => {
            setCameraOpen(false);
            onScan(value);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Keyboard / hardware scanner input */}
      {!cameraOpen && (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            placeholder="Scan or type barcode..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-label="Pallet barcode input"
            className="scan-input"
          />
          {inputValue.trim().length >= 3 && (
            <button type="submit" className="warehouse-button-primary w-full">
              Confirm Barcode
            </button>
          )}
        </form>
      )}

      {/* Camera toggle */}
      <button
        type="button"
        onClick={() => setCameraOpen((v) => !v)}
        aria-label={cameraOpen ? "Close camera scanner" : "Open camera scanner"}
        className="warehouse-button-secondary w-full flex items-center justify-center gap-2"
      >
        {cameraOpen ? (
          <>
            <CameraOff className="w-5 h-5" aria-hidden="true" />
            Close Camera
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" aria-hidden="true" />
            Use Camera
          </>
        )}
      </button>
    </div>
  );
}