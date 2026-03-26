"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, AlertCircle, Camera, CameraOff } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

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

interface SKUScannerProps {
  expectedSKU: string;
  onScan: (value: string) => void;
  isValid: boolean;
}

export function SKUScanner({ expectedSKU, onScan, isValid }: SKUScannerProps) {
  const [inputValue, setInputValue] = useState("");
  const [hasError, setHasError] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const { inputRef } = useBarcodeScanner({
    onScan: (value) => {
      setInputValue(value);
      const match = value.toUpperCase() === expectedSKU.toUpperCase();
      setHasError(!match);
      onScan(value);
    },
    enabled: !isValid && !cameraOpen,
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim().toUpperCase();
    if (val.length >= 3) {
      const match = val === expectedSKU.toUpperCase();
      setHasError(!match);
      onScan(val);
    }
  };

  // ── Verified state ──────────────────────────────────────────────
  if (isValid) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-4 border-2"
        style={{
          borderColor: "#bbf7d0",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          boxShadow: "0 3px 12px rgba(22,163,74,0.12)",
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-600" aria-hidden="true" />
        </div>
        <div>
          <p className="font-bold text-green-800">SKU Verified ✓</p>
          <p className="text-sm font-mono text-green-600 mt-0.5">{expectedSKU}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-700">
        Scan SKU Barcode <span className="text-red-500">*</span>
      </label>

      {/* Camera scanner */}
      {cameraOpen && (
        <CameraScanner
          onScan={(value) => {
            setCameraOpen(false);
            const match = value.toUpperCase() === expectedSKU.toUpperCase();
            setHasError(!match);
            setInputValue(value);
            onScan(value);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Hardware / keyboard input */}
      {!cameraOpen && (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.toUpperCase());
              setHasError(false);
            }}
            placeholder="Scan SKU barcode..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-label="SKU barcode input"
            aria-invalid={hasError}
            className={`scan-input ${
              hasError
                ? "border-red-400 focus:border-red-500"
                : "border-blue-300 focus:border-blue-500"
            }`}
          />
          {inputValue.trim().length >= 3 && (
            <button type="submit" className="warehouse-button warehouse-button-primary w-full">
              Confirm SKU
            </button>
          )}
        </form>
      )}

      {hasError && (
        <div
          className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold"
          style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          SKU mismatch — scan again or use the Error button.
        </div>
      )}

      {/* Camera toggle */}
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