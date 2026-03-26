"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtn: "warehouse-button-danger",
  },
  warning: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmBtn:
      "warehouse-button bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400",
  },
  info: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBtn: "warehouse-button-primary",
  },
} as const;

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm px-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl ${styles.iconBg} flex items-center justify-center`}
          >
            <AlertTriangle
              className={`w-7 h-7 ${styles.iconColor}`}
              aria-hidden="true"
            />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="mt-1.5 text-sm text-gray-500">{message}</p>
          </div>

          {/* Buttons — Cancel auto-focused (safe default) */}
          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            <button autoFocus onClick={onCancel} className="warehouse-button-secondary">
              {cancelLabel}
            </button>
            <button onClick={onConfirm} className={styles.confirmBtn}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}