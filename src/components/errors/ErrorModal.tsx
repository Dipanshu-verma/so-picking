"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
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
}[] = [
  {
    type: ErrorType.PALLET_NOT_FOUND,
    label: "Pallet Not Found",
    description: "Pallet is missing from the location",
  },
  {
    type: ErrorType.PALLET_MISMATCH,
    label: "Pallet Mismatch",
    description: "Scanned tag does not match expected",
  },
  {
    type: ErrorType.PALLET_EMPTY,
    label: "Pallet Empty",
    description: "Pallet exists but has no items",
  },
  {
    type: ErrorType.SKU_SHORT,
    label: "SKU Short",
    description: "Fewer items than required quantity",
  },
  {
    type: ErrorType.SKU_MISMATCH,
    label: "SKU Mismatch",
    description: "Wrong SKU found at this location",
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

  // Reset every time the modal opens
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
                 bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label="Report picking error"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden
                   animate-slide-up max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Report Error</h2>
              <p className="text-xs text-gray-500">{location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close error modal"
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Error type selection */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Select Error Type <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {ERROR_OPTIONS.map((opt) => {
                const isSelected = selected === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelected(opt.type)}
                    aria-pressed={isSelected}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2
                                transition-all duration-100
                                ${
                                  isSelected
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio dot */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                                    ${
                                      isSelected
                                        ? "border-red-500 bg-red-500"
                                        : "border-gray-300"
                                    }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isSelected ? "text-red-700" : "text-gray-800"
                          }`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base
                         outline-none resize-none transition-colors
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                         placeholder-gray-400"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {note.length}/500
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="warehouse-button-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected}
            className="warehouse-button-danger flex-1
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Error
          </button>
        </div>
      </div>
    </div>
  );
}