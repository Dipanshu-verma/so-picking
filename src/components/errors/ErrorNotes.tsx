"use client";

interface ErrorNotesProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ErrorNotes({
  value,
  onChange,
  maxLength = 500,
  placeholder = "Add any additional notes about this error...",
  autoFocus = false,
}: ErrorNotesProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        Notes{" "}
        <span className="text-gray-400 font-normal">(optional)</span>
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={maxLength}
        autoFocus={autoFocus}
        aria-label="Error notes"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base
                   outline-none resize-none transition-colors
                   focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                   placeholder-gray-400 text-gray-900"
      />

      <p className="text-right text-xs text-gray-400">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}