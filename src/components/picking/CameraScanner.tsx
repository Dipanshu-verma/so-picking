"use client";

import { useEffect, useRef, useState } from "react";
import { X, CameraOff } from "lucide-react";
import { sanitizeBarcode } from "@/lib/utils";

interface CameraScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

const SCANNER_ELEMENT_ID = "camera-scanner-viewport";

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  // Prevent onScan firing multiple times after first successful scan
  const hasScannedRef = useRef(false);

 useEffect(() => {
  let isMounted = true;
  // Track whether stop() has already been called to prevent double-stop
  const isStoppedRef = { current: false };

  const stopScanner = async () => {
    if (isStoppedRef.current) return;
    isStoppedRef.current = true;
    try {
      await scannerRef.current?.stop();
    } catch {
      // Already stopped — safe to ignore
    }
  };

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!isMounted) return;

      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      const devices = await Html5Qrcode.getCameras();
      if (!isMounted) return;

      if (!devices || devices.length === 0) {
        setError("No camera found on this device.");
        setIsStarting(false);
        return;
      }

      const rearCamera = devices.find(
        (d) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
      );
      const cameraId = rearCamera ? rearCamera.id : devices[0].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 280, height: 140 },
          aspectRatio: 2.0,
        },
        (decodedText: string) => {
          if (hasScannedRef.current) return;
          const clean = sanitizeBarcode(decodedText);
          if (clean.length >= 3) {
            hasScannedRef.current = true;
            // Stop first, then fire callback
            stopScanner().then(() => {
              if (isMounted) onScan(clean);
            });
          }
        },
        () => {}
      );

      if (isMounted) setIsStarting(false);
    } catch (err) {
      if (!isMounted) return;
      const message =
        err instanceof Error ? err.message : "Camera failed to start";

      if (
        message.toLowerCase().includes("permission") ||
        message.toLowerCase().includes("notallowed")
      ) {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (message.toLowerCase().includes("notfound")) {
        setError("No camera found on this device.");
      } else {
        setError(`Camera error: ${message}`);
      }
      setIsStarting(false);
    }
  };

  startScanner();

  return () => {
    isMounted = false;
    stopScanner();
  };
}, [onScan]);

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-blue-300 bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close camera scanner"
        className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full bg-black/60
                   flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X className="w-5 h-5 text-white" aria-hidden="true" />
      </button>

      {/* Starting indicator */}
      {isStarting && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center
                        justify-center gap-2 bg-black">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white
                          rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Starting camera...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center gap-3
                        py-10 px-6 bg-black min-h-[180px]">
          <CameraOff className="w-10 h-10 text-red-400" aria-hidden="true" />
          <p className="text-white/80 text-sm text-center">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 text-white
                       text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Scan viewport — html5-qrcode renders into this div */}
      <div
        id={SCANNER_ELEMENT_ID}
        className={`w-full ${error ? "hidden" : ""}`}
      />

      {/* Scan guide overlay */}
      {!isStarting && !error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 py-2
                        bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-center text-white/80 text-xs font-medium">
            Point at the barcode
          </p>
        </div>
      )}
    </div>
  );
}