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
  colorClass = "bg-blue-600",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-right text-xs text-gray-500 font-medium">
          {clamped}%
        </p>
      )}
    </div>
  );
}