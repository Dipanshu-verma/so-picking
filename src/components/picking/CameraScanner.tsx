"use client";

import { useEffect, useRef, useState } from "react";
import { X, CameraOff, ScanLine } from "lucide-react";
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
  const hasScannedRef = useRef(false);

 useEffect(() => {
  let isMounted = true;
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
    <div
      className="relative rounded-2xl overflow-hidden border-2"
      style={{
        borderColor: "#2563eb",
        boxShadow: "0 0 0 4px rgba(37,99,235,0.12), 0 4px 20px rgba(0,0,0,0.2)",
        background: "#000",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close camera scanner"
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center
                   justify-center transition-colors active:scale-95"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      >
        <X className="w-5 h-5 text-white" aria-hidden="true" />
      </button>

      {/* Starting indicator */}
      {isStarting && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center
                        justify-center gap-3 bg-black">
          <div
            className="w-10 h-10 rounded-full border-2"
            style={{
              borderColor: "rgba(255,255,255,0.15)",
              borderTopColor: "#fff",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p className="text-white/70 text-sm font-medium">Starting camera...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center gap-4
                        py-12 px-6 bg-black min-h-[200px]">
          <div className="w-14 h-14 rounded-2xl bg-red-900/30 flex items-center justify-center">
            <CameraOff className="w-7 h-7 text-red-400" aria-hidden="true" />
          </div>
          <p className="text-white/80 text-sm text-center leading-relaxed">{error}</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                       transition-colors"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            Close
          </button>
        </div>
      )}

      {/* Scan viewport */}
      <div
        id={SCANNER_ELEMENT_ID}
        className={`w-full ${error ? "hidden" : ""}`}
      />

      {/* Scan guide overlay */}
      {!isStarting && !error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 py-3
                        flex flex-col items-center gap-1"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
        >
          <ScanLine className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <p className="text-center text-white/80 text-xs font-semibold">
            Point at the barcode
          </p>
        </div>
      )}
    </div>
  );
}