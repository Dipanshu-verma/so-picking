"use client";

import { AlertTriangle, Info, AlertCircle } from "lucide-react";

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
    iconBg: "linear-gradient(135deg, #dc2626, #b91c1c)",
    iconShadow: "0 3px 10px rgba(220,38,38,0.35)",
    Icon: AlertTriangle,
    confirmBtn: "warehouse-button warehouse-button-danger",
    headerGrad: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
    headerBorder: "#fecdd3",
  },
  warning: {
    iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
    iconShadow: "0 3px 10px rgba(245,158,11,0.35)",
    Icon: AlertCircle,
    confirmBtn: "warehouse-button bg-amber-500 text-white hover:bg-amber-600",
    headerGrad: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    headerBorder: "#fde68a",
  },
  info: {
    iconBg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    iconShadow: "0 3px 10px rgba(37,99,235,0.35)",
    Icon: Info,
    confirmBtn: "warehouse-button warehouse-button-primary",
    headerGrad: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    headerBorder: "#bfdbfe",
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
  const { Icon } = styles;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden bounce-in"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        {/* Gradient top strip */}
        <div
          className="px-6 py-5"
          style={{ background: styles.headerGrad, borderBottom: `1px solid ${styles.headerBorder}` }}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: styles.iconBg,
                boxShadow: styles.iconShadow,
              }}
            >
              <Icon className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-slate-500 text-sm text-center leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
          <button autoFocus onClick={onCancel} className="warehouse-button warehouse-button-secondary">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}