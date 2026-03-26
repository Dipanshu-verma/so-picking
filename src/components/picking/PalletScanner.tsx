"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Scan, Camera, CameraOff, MapPin, Package } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import type { LocationGroup } from "@/types/picking";

const CameraScanner = dynamic(
  () =>
    import("@/components/picking/CameraScanner").then((m) => ({
      default: m.CameraScanner,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 rounded-2xl skeleton flex items-center justify-center">
        <p className="text-sm text-slate-400 font-medium">Starting camera...</p>
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
      {/* ── Location info card ────────────────────────────────── */}
      <div
        className="rounded-2xl border-2 p-5"
        style={{
          borderColor: "#bfdbfe",
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          boxShadow: "0 4px 20px rgba(37,99,235,0.1)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
            }}
          >
            <MapPin className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">
              Location {locationIndex + 1} of {totalLocations}
            </p>
            <p className="text-3xl font-black text-slate-900 mt-0.5 truncate tracking-tight">
              {location.location}
            </p>
          </div>
        </div>

        {/* SKU hint */}
        <div className="mt-4 pt-4 border-t border-blue-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-blue-500" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">{location.skuName}</p>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              {location.sku} · <span className="font-bold">Qty: {location.quantity}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Scan instruction ─────────────────────────────────── */}
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 scan-pulse"
          style={{
            background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
            border: "2px solid #e2e8f0",
          }}
        >
          <Scan className="w-8 h-8 text-slate-500" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Scan Pallet Barcode</h2>
        <p className="text-sm text-slate-500 mt-1">
          Scan the pallet barcode at{" "}
          <strong className="text-slate-800 font-bold">{location.location}</strong>
        </p>
      </div>

      {/* ── Camera scanner ───────────────────────────────────── */}
      {cameraOpen && (
        <CameraScanner
          onScan={(value) => {
            setCameraOpen(false);
            onScan(value);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* ── Keyboard / hardware scanner input ─────────────────── */}
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
            <button
              type="submit"
              className="warehouse-button warehouse-button-primary w-full"
            >
              Confirm Barcode
            </button>
          )}
        </form>
      )}

      {/* ── Camera toggle ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setCameraOpen((v) => !v)}
        aria-label={cameraOpen ? "Close camera scanner" : "Open camera scanner"}
        className="warehouse-button warehouse-button-secondary w-full flex items-center justify-center gap-2"
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