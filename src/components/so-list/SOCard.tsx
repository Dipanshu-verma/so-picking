"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ChevronRight, Calendar, QrCode } from "lucide-react";
import { SOStatus } from "@/constants";
import { formatDate } from "@/lib/utils";
import { soDetailsDB, skuMasterDB } from "@/lib/offline-db";
import type { SOListRow } from "@/types/sheets";

interface SOCardProps {
  so: SOListRow;
}

const STATUS_LABEL: Record<SOStatus, string> = {
  [SOStatus.PENDING]: "Pending",
  [SOStatus.IN_PROGRESS]: "In Progress",
  [SOStatus.COMPLETED]: "Completed",
  [SOStatus.COMPLETED_WITH_ERRORS]: "With Errors",
  [SOStatus.IGNORED]: "Ignored",
};

const STATUS_STYLE: Record<SOStatus, string> = {
  [SOStatus.PENDING]: "bg-gray-100 text-gray-700 border border-gray-200",
  [SOStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700 border border-blue-200",
  [SOStatus.COMPLETED]: "bg-green-100 text-green-700 border border-green-200",
  [SOStatus.COMPLETED_WITH_ERRORS]:
    "bg-orange-100 text-orange-700 border border-orange-200",
  [SOStatus.IGNORED]: "bg-red-100 text-red-700 border border-red-200",
};

export function SOCard({ so }: SOCardProps) {
  const router = useRouter();

  // Prefetch SO details + SKU master into IndexedDB on hover
  // so the detail page loads instantly even if network is slow
  const handlePrefetch = useCallback(async () => {
    try {
      // Only prefetch if not already cached
      const [existingDetails, existingSKU] = await Promise.all([
        soDetailsDB.get(so.so),
        skuMasterDB.get(),
      ]);

      const fetchPromises: Promise<void>[] = [];

      if (!existingDetails) {
        fetchPromises.push(
          fetch(`/api/sheets/so-details?soId=${encodeURIComponent(so.so)}`)
            .then((r) => r.json())
            .then((json) => {
              if (json.success) soDetailsDB.set(so.so, json.data);
            })
            .catch(() => {}) // Prefetch is best-effort — silent fail
        );
      }

      if (!existingSKU) {
        fetchPromises.push(
          fetch("/api/sheets/sku-master")
            .then((r) => r.json())
            .then((json) => {
              if (json.success) skuMasterDB.set(json.data);
            })
            .catch(() => {})
        );
      }

      await Promise.all(fetchPromises);
    } catch {
      // Prefetch is best-effort — never block or throw
    }
  }, [so.so]);

  const handleClick = () => {
    router.push(`/so/${encodeURIComponent(so.so)}`);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handlePrefetch}    // Desktop hover
      onFocus={handlePrefetch}         // Keyboard nav / tab focus
      onTouchStart={handlePrefetch}    // Mobile touch start (fires before click)
      className="w-full text-left warehouse-card hover:shadow-md hover:border-blue-200
                 transition-all duration-150 active:scale-[0.98] focus:outline-none
                 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{so.so}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="text-sm text-gray-500">{formatDate(so.date)}</span>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                           text-xs font-semibold
                           ${STATUS_STYLE[so.status] ?? STATUS_STYLE[SOStatus.PENDING]}`}
            >
              {STATUS_LABEL[so.status] ?? so.status}
            </span>
            {so.scanSku && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                            text-xs font-semibold bg-purple-100 text-purple-700
                            border border-purple-200"
              >
                <QrCode className="w-3 h-3" aria-hidden="true" />
                SKU Scan
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" aria-hidden="true" />
      </div>
    </button>
  );
}