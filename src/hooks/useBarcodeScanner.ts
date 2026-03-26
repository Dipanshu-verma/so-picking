"use client";

import { useEffect, useRef, useCallback } from "react";
import { HardwareScannerDetector } from "@/lib/barcode";
import { BARCODE_CONFIG } from "@/constants";
import type { ScanEvent } from "@/lib/barcode";

interface UseBarcodeScanlnerOptions {
  onScan: (value: string, event: ScanEvent) => void;
  enabled?: boolean;
}

interface UseBarcodeScanlnerReturn {
  inputRef: React.RefObject<HTMLInputElement | null>;
  resetInput: () => void;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
}: UseBarcodeScanlnerOptions): UseBarcodeScanlnerReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const detectorRef = useRef<HardwareScannerDetector | null>(null);
  // Use ref to keep callback stable without re-creating listeners
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    detectorRef.current = new HardwareScannerDetector((event: ScanEvent) => {
      if (event.value.length < BARCODE_CONFIG.MIN_BARCODE_LENGTH) return;
      onScanRef.current(event.value, event);
    });

    const handleKeydown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      // Process if our input is focused OR hardware scanner fires with body/null focus
      const isOurInput = inputRef.current && active === inputRef.current;
      const isNoInput = !active || active === document.body;
      if (isOurInput || isNoInput) {
        detectorRef.current?.handleKeydown(e);
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      detectorRef.current?.destroy();
    };
  }, [enabled]);

  // Auto-focus input when enabled
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [enabled]);

  const resetInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, []);

  return { inputRef, resetInput };
}