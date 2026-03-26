"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { soListDB, soDetailsDB, skuMasterDB, pickingProgressDB, errorQueueDB } from "@/lib/offline-db";
import { LocationStatus, SOStatus } from "@/constants";
import { groupBy } from "@/lib/utils";
import type { LocationGroup, ActiveSO } from "@/types/picking";
import type { SOListRow, SODetailsRow, SKUMasterRow } from "@/types/sheets";
import { usePickingStore } from "@/store/picking-store";

interface UseSODetailReturn {
  soRow: SOListRow | null;
  locations: LocationGroup[];
  isLoading: boolean;
  isStarting: boolean;
  error: string | null;
  completedCount: number;
  totalCount: number;
  canResume: boolean;
  handleStartPicking: () => Promise<void>;
}

// Build LocationGroup array from SO details + SKU master
function buildLocationGroups(
  details: SODetailsRow[],
  skuMap: Record<string, string>,
  savedStatuses: Record<string, LocationStatus> = {}
): LocationGroup[] {
  // Group rows by location — aggregate quantity if multiple rows per location
  const grouped = groupBy(details, (d) => d.location);

  return Object.entries(grouped).map(([location, rows]) => {
    const first = rows[0];
    const totalQty = rows.reduce((sum, r) => sum + r.quantity, 0);
    return {
      location,
      tag: first.tag,
      sku: first.sku,
      skuName: skuMap[first.sku] ?? first.sku, // Fallback to SKU code if name missing
      quantity: totalQty,
      status: savedStatuses[location] ?? LocationStatus.PENDING,
    };
  });
}

export function useSODetail(soId: string): UseSODetailReturn {
  const router = useRouter();
  const { setActiveSO } = usePickingStore();

  const [soRow, setSoRow] = useState<SOListRow | null>(null);
  const [locations, setLocations] = useState<LocationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResume, setCanResume] = useState(false);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    try {
      let detailRows: SODetailsRow[] = [];
      let skuRows: SKUMasterRow[] = [];
      let foundSORow: SOListRow | null = null;

      if (isOnline) {
        // ── Online: fetch from API + cache ──────────────────────────────
        const [detailRes, skuRes] = await Promise.all([
          fetch(`/api/sheets/so-details?soId=${encodeURIComponent(soId)}`),
          fetch(`/api/sheets/sku-master`),
        ]);

        if (!detailRes.ok) throw new Error(`Failed to fetch SO details (${detailRes.status})`);
        if (!skuRes.ok) throw new Error(`Failed to fetch SKU master (${skuRes.status})`);

        const detailJson = await detailRes.json();
        const skuJson = await skuRes.json();

        if (!detailJson.success) throw new Error(detailJson.error ?? "SO details error");
        if (!skuJson.success) throw new Error(skuJson.error ?? "SKU master error");

        detailRows = detailJson.data as SODetailsRow[];
        skuRows = skuJson.data as SKUMasterRow[];

        // Cache both for offline use
        await soDetailsDB.set(soId, detailRows);
        await skuMasterDB.set(skuRows);

        // Get SO row from soList cache (has rowIndex + scanSku)
        const cachedSOList = await soListDB.get();
// Fetch this specific SO's current status directly from the sheet
// We cannot rely on SO list cache — it only contains PENDING orders
const soStatusRes = await fetch(`/api/sheets/so-list?soId=${encodeURIComponent(soId)}`);
if (soStatusRes.ok) {
  const soStatusJson = await soStatusRes.json();
  if (soStatusJson.success && soStatusJson.data.length > 0) {
    foundSORow = soStatusJson.data[0];
  }
}      } else {
        // ── Offline: read from IndexedDB ─────────────────────────────
        const [cachedDetails, cachedSKU, cachedSOList] = await Promise.all([
          soDetailsDB.get(soId),
          skuMasterDB.get(),
          soListDB.get(),
        ]);

        if (!cachedDetails || cachedDetails.data.length === 0) {
          throw new Error("No offline data for this SO. Connect to internet first.");
        }

        detailRows = cachedDetails.data;
        skuRows = cachedSKU?.data ?? [];
// Fetch this specific SO's current status directly from the sheet
// We cannot rely on SO list cache — it only contains PENDING orders
const soStatusRes = await fetch(`/api/sheets/so-list?soId=${encodeURIComponent(soId)}`);
if (soStatusRes.ok) {
  const soStatusJson = await soStatusRes.json();
  if (soStatusJson.success && soStatusJson.data.length > 0) {
    foundSORow = soStatusJson.data[0];
  }
}      }

    setSoRow(foundSORow);

if (
  foundSORow?.status === SOStatus.COMPLETED ||
  foundSORow?.status === SOStatus.COMPLETED_WITH_ERRORS ||
  foundSORow?.status === SOStatus.IGNORED
) {
  setError(
    `This SO is already ${foundSORow.status.replaceAll("_", " ")}. No further picking allowed.`
  );
  setIsLoading(false);
  return;
}
    

// If SO is back to PENDING, clear any stale local progress
// This handles the case where sheet is manually reset
if (
  foundSORow &&
  (foundSORow.status as SOStatus) !== SOStatus.IN_PROGRESS &&
  (foundSORow.status as SOStatus) !== SOStatus.COMPLETED &&
  (foundSORow.status as SOStatus) !== SOStatus.COMPLETED_WITH_ERRORS
) {
  await Promise.allSettled([
    pickingProgressDB.clear(soId),
    errorQueueDB.clearForSO(soId),
  ]);
  setCanResume(false);
}

      // Build SKU name lookup map
      const skuMap = skuRows.reduce<Record<string, string>>((acc, s) => {
        acc[s.sku] = s.name;
        return acc;
      }, {});

      // Check if there's saved picking progress (resume scenario)
      const savedProgress = await pickingProgressDB.get(soId);
      const savedStatuses = savedProgress?.locationStatuses ?? {};

      if (savedProgress) setCanResume(true);

      const locationGroups = buildLocationGroups(detailRows, skuMap, savedStatuses);
      setLocations(locationGroups);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load SO details";
      console.error("[useSODetail] Error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [soId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // ── Computed ────────────────────────────────────────────────────────────
  const totalCount = locations.length;
  const completedCount = locations.filter(
    (l) => l.status === LocationStatus.COMPLETED || l.status === LocationStatus.ERROR
  ).length;

  // ── Start / Resume Picking ───────────────────────────────────────────────
  const handleStartPicking = useCallback(async () => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (!isOnline) {
      toast.error("Internet required to start picking.");
      return;
    }

    if (!soRow) {
      toast.error("SO data not loaded. Please refresh.");
      return;
    }

    setIsStarting(true);

    try {
      // Update status to IN_PROGRESS in Google Sheets
      const res = await fetch("/api/sheets/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex: soRow.rowIndex, status: SOStatus.IN_PROGRESS }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      // Build ActiveSO for Zustand store
      const activeSO: ActiveSO = {
        soId,
        date: soRow.date,
        scanSku: soRow.scanSku,
        locations,
        totalLocations: totalCount,
        completedLocations: completedCount,
        currentLocationIndex: canResume
          ? locations.findIndex(
              (l) => l.status === LocationStatus.PENDING
            )
          : 0,
      };

      // Correct currentLocationIndex if all done or -1
      if (activeSO.currentLocationIndex < 0) activeSO.currentLocationIndex = 0;

      setActiveSO(activeSO);

      toast.success("Starting pick flow...");
      router.push(`/so/${encodeURIComponent(soId)}/picking`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start picking";
      console.error("[useSODetail] Start picking error:", message);
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  }, [soRow, soId, locations, totalCount, completedCount, canResume, setActiveSO, router]);

  return {
    soRow,
    locations,
    isLoading,
    isStarting,
    error,
    completedCount,
    totalCount,
    canResume,
    handleStartPicking,
  };
}