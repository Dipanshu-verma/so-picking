import { BARCODE_CONFIG } from "@/constants";
import { sanitizeBarcode } from "@/lib/utils";

// ─────────────────────────────────────────────
// Barcode Scanner Types
// ─────────────────────────────────────────────
export type ScannerMode = "camera" | "hardware" | "keyboard";

export interface ScanEvent {
  value: string;
  mode: ScannerMode;
  timestamp: number;
}

export type ScanCallback = (event: ScanEvent) => void;

// ─────────────────────────────────────────────
// Hardware Scanner Detection
// Uses timing: hardware scanners type very fast (< 50ms between keystrokes)
// ─────────────────────────────────────────────
export class HardwareScannerDetector {
  private buffer: string = "";
  private lastKeystrokeTime: number = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private callback: ScanCallback;

  constructor(callback: ScanCallback) {
    this.callback = callback;
  }

  handleKeydown(event: KeyboardEvent): void {
    const now = Date.now();
    const timeSinceLast = now - this.lastKeystrokeTime;

    // If gap is large, reset buffer (new scan starting)
    if (timeSinceLast > 200 && this.buffer.length > 0) {
      this.buffer = "";
    }

    this.lastKeystrokeTime = now;

    // Only process printable characters
    if (event.key.length === 1) {
      this.buffer += event.key;
    }

    // Enter key = end of scan
    if (event.key === "Enter" && this.buffer.length >= BARCODE_CONFIG.MIN_BARCODE_LENGTH) {
      const scannedValue = sanitizeBarcode(this.buffer);
      const isHardwareScan = timeSinceLast < BARCODE_CONFIG.HARDWARE_SCAN_THRESHOLD_MS;

      this.callback({
        value: scannedValue,
        mode: isHardwareScan ? "hardware" : "keyboard",
        timestamp: now,
      });

      this.buffer = "";

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }

    // Auto-clear buffer after 500ms if no Enter pressed
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.buffer = "";
    }, 500);
  }

  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.buffer = "";
  }
}

// ─────────────────────────────────────────────
// Validate barcode format
// ─────────────────────────────────────────────
export function validateBarcode(value: string): boolean {
  if (!value || value.length < BARCODE_CONFIG.MIN_BARCODE_LENGTH) return false;
  // Only alphanumeric + hyphens + underscores
  return /^[A-Z0-9\-_]+$/i.test(value);
}

// ─────────────────────────────────────────────
// Compare barcodes (case insensitive)
// ─────────────────────────────────────────────
export function compareBarcode(scanned: string, expected: string): boolean {
  return sanitizeBarcode(scanned) === sanitizeBarcode(expected);
}