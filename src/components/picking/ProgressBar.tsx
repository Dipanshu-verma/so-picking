"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number; // 0–100
  showLabel?: boolean;
  colorClass?: string;
}

export function ProgressBar({
  percent,
  showLabel = false,
  colorClass,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-track">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: colorClass
              ? undefined
              : "linear-gradient(90deg, #2563eb 0%, #60a5fa 60%, #38bdf8 100%)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        </motion.div>
      </div>
      {showLabel && (
        <p className="mt-1.5 text-right text-xs text-slate-500 font-semibold tabular-nums">
          {clamped}%
        </p>
      )}
    </div>
  );
}