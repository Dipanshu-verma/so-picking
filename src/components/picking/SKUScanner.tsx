"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

interface SKUScannerProps {
  expectedSKU: string;
  onScan: (value: string) => void;
  isValid: boolean;
}

export function SKUScanner({ expectedSKU, onScan, isValid }: SKUScannerProps) {
  const [inputValue, setInputValue] = useState("");
  const [hasError, setHasError] = useState(false);

  const { inputRef } = useBarcodeScanner({
    onScan: (value) => {
      setInputValue(value);
      const match = value.toUpperCase() === expectedSKU.toUpperCase();
      setHasError(!match);
      onScan(value);
    },
    enabled: !isValid,
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
      <div className="flex items-center gap-3 bg-green-50 border-2 border-green-300
                      rounded-xl px-4 py-4">
        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold text-green-800">SKU Verified</p>
          <p className="text-sm font-mono text-green-600">{expectedSKU}</p>
        </div>
      </div>
    );
  }

  // ── Scan input state ────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Scan SKU Barcode <span className="text-red-500">*</span>
      </label>

      <form onSubmit={handleManualSubmit}>
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
      </form>

      {hasError && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          SKU mismatch — scan again or use the Error button.
        </div>
      )}
    </div>
  );
}