"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ChevronRight, Calendar, QrCode, Package } from "lucide-react";
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
  [SOStatus.PENDING]: "badge badge-pending",
  [SOStatus.IN_PROGRESS]: "badge badge-progress",
  [SOStatus.COMPLETED]: "badge badge-success",
  [SOStatus.COMPLETED_WITH_ERRORS]: "badge badge-warning",
  [SOStatus.IGNORED]: "badge badge-error",
};

const STATUS_DOT: Record<SOStatus, string> = {
  [SOStatus.PENDING]: "bg-slate-400",
  [SOStatus.IN_PROGRESS]: "bg-blue-500",
  [SOStatus.COMPLETED]: "bg-green-500",
  [SOStatus.COMPLETED_WITH_ERRORS]: "bg-amber-500",
  [SOStatus.IGNORED]: "bg-red-500",
};

export function SOCard({ so }: SOCardProps) {
  const router = useRouter();

  const handlePrefetch = useCallback(async () => {
    try {
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
            .catch(() => {})
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
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="w-full text-left warehouse-card warehouse-card-hover
                 transition-all duration-200 active:scale-[0.98] focus:outline-none
                 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 group fade-in"
      style={{ animationDelay: "var(--stagger-delay, 0ms)" }}
    >
      <div className="flex items-center gap-4">
        {/* Left icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                     bg-slate-50 border border-slate-200 group-hover:border-blue-200
                     group-hover:bg-blue-50 transition-colors"
        >
          <Package className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
        </div>

        {/* Middle: SO info */}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-slate-900 truncate tracking-tight leading-tight">
            {so.so}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="text-sm text-slate-500">{formatDate(so.date)}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={STATUS_STYLE[so.status] ?? STATUS_STYLE[SOStatus.PENDING]}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[so.status] ?? "bg-slate-400"}`}
              />
              {STATUS_LABEL[so.status] ?? so.status}
            </span>
            {so.scanSku && (
              <span className="badge" style={{ background: "#f3e8ff", color: "#7e22ce", borderColor: "#e9d5ff" }}>
                <QrCode className="w-3 h-3" aria-hidden="true" />
                SKU Scan
              </span>
            )}
          </div>
        </div>

        {/* Right: chevron */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full
                        bg-slate-50 group-hover:bg-blue-50 transition-colors shrink-0">
          <ChevronRight
            className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors"
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  );
}