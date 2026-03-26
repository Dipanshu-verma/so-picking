import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { API_CONFIG, SOUND_CONFIG } from "@/constants";

// ─────────────────────────────────────────────
// Tailwind class merger
// ─────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────
// Format date for display
// ─────────────────────────────────────────────
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "dd MMM yyyy");
  } catch {
    return dateString;
  }
}

// ─────────────────────────────────────────────
// Retry with exponential backoff
// ─────────────────────────────────────────────
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS,
  baseDelay: number = API_CONFIG.RETRY_BASE_DELAY_MS
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === attempts) break;

      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1),
        API_CONFIG.RETRY_MAX_DELAY_MS
      );
      console.warn(
        `[Retry] Attempt ${attempt}/${attempts} failed. Retrying in ${delay}ms...`,
        lastError.message
      );
      await sleep(delay);
    }
  }

  throw lastError!;
}

// ─────────────────────────────────────────────
// Sleep utility
// ─────────────────────────────────────────────
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
// Generate sync ID (idempotency key)
// ─────────────────────────────────────────────
export function generateSyncId(soId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${soId}_${timestamp}_${random}`;
}

// ─────────────────────────────────────────────
// Sound feedback (success / error)
// ─────────────────────────────────────────────
export function playSound(type: "success" | "error"): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value =
      type === "success"
        ? SOUND_CONFIG.SUCCESS_FREQUENCY
        : SOUND_CONFIG.ERROR_FREQUENCY;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + SOUND_CONFIG.DURATION_MS / 1000
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + SOUND_CONFIG.DURATION_MS / 1000);
  } catch {
    // Silently fail — sound is optional
  }
}

// ─────────────────────────────────────────────
// Vibration feedback
// ─────────────────────────────────────────────
export function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// ─────────────────────────────────────────────
// Sanitize barcode input (prevent injection)
// ─────────────────────────────────────────────
export function sanitizeBarcode(value: string): string {
  // Allow alphanumeric, hyphens, underscores only
  return value.replace(/[^a-zA-Z0-9\-_]/g, "").trim().toUpperCase();
}

// ─────────────────────────────────────────────
// Check if data cache is stale
// ─────────────────────────────────────────────
export function isCacheStale(
  cachedAt: number,
  ttlMs: number = API_CONFIG.CACHE_TTL_MS
): boolean {
  return Date.now() - cachedAt > ttlMs;
}

// ─────────────────────────────────────────────
// Group array by key
// ─────────────────────────────────────────────
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ─────────────────────────────────────────────
// Safe JSON parse
// ─────────────────────────────────────────────
export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────
// Truncate string
// ─────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}