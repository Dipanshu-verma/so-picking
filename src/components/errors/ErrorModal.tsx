"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ErrorType } from "@/constants";

interface ErrorModalProps {
  isOpen: boolean;
  location: string;
  preSelected?: ErrorType;
  onSubmit: (type: ErrorType, note: string) => void;
  onClose: () => void;
}

const ERROR_OPTIONS: {
  type: ErrorType;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    type: ErrorType.PALLET_NOT_FOUND,
    label: "Pallet Not Found",
    description: "Pallet is missing from the location",
    emoji: "🔍",
  },
  {
    type: ErrorType.PALLET_MISMATCH,
    label: "Pallet Mismatch",
    description: "Scanned tag does not match expected",
    emoji: "❌",
  },
  {
    type: ErrorType.PALLET_EMPTY,
    label: "Pallet Empty",
    description: "Pallet exists but has no items",
    emoji: "📦",
  },
  {
    type: ErrorType.SKU_SHORT,
    label: "SKU Short",
    description: "Fewer items than required quantity",
    emoji: "⚠️",
  },
  {
    type: ErrorType.SKU_MISMATCH,
    label: "SKU Mismatch",
    description: "Wrong SKU found at this location",
    emoji: "🔄",
  },
];

export function ErrorModal({
  isOpen,
  location,
  preSelected,
  onSubmit,
  onClose,
}: ErrorModalProps) {
  const [selected, setSelected] = useState<ErrorType | null>(
    preSelected ?? null
  );
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected(preSelected ?? null);
      setNote("");
    }
  }, [isOpen, preSelected]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected, note.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 px-4 pb-4 sm:pb-0"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Report picking error"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden
                   animate-slide-up max-h-[92vh] flex flex-col"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
            borderBottom: "1px solid #fecdd3",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                boxShadow: "0 3px 10px rgba(220,38,38,0.35)",
              }}
            >
              <AlertTriangle className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Report Error</h2>
              <p className="text-xs text-slate-500 font-mono">{location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close error modal"
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       hover:bg-red-100 transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Error type selection */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">
              Select Error Type <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2.5">
              {ERROR_OPTIONS.map((opt) => {
                const isSelected = selected === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelected(opt.type)}
                    aria-pressed={isSelected}
                    className={`w-full text-left px-4 py-4 rounded-2xl border-2
                                transition-all duration-150 active:scale-[0.98]
                                ${
                                  isSelected
                                    ? "border-red-400"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                    style={
                      isSelected
                        ? {
                            background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                            boxShadow: "0 3px 12px rgba(220,38,38,0.12)",
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      {/* Check indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center
                                    transition-all duration-150
                                    ${
                                      isSelected
                                        ? "border-red-500 bg-red-500"
                                        : "border-slate-300"
                                    }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>

                      <span className="text-2xl">{opt.emoji}</span>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold leading-tight ${
                            isSelected ? "text-red-700" : "text-slate-800"
                          }`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Notes{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base
                         outline-none resize-none transition-all duration-200
                         focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                         placeholder:text-slate-400 font-medium"
            />
            <p className="text-right text-xs text-slate-400 mt-1 font-medium">
              {note.length}/500
            </p>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div
          className="px-5 py-4 flex gap-3"
          style={{ borderTop: "1px solid #f1f5f9" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="warehouse-button warehouse-button-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected}
            className="warehouse-button warehouse-button-danger flex-1
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Error
          </button>
        </div>
      </div>
    </div>
  );
}