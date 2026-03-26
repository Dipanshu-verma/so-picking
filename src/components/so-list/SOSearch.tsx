"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SOSearchProps {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export function SOSearch({ value, onChange, debounceMs = 300 }: SOSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative">
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
        <Search className="w-5 h-5 text-slate-400" aria-hidden="true" />
      </div>

      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder="Search Sales Order..."
        autoComplete="off"
        aria-label="Search Sales Orders"
        className="w-full pl-12 pr-12 py-4 text-base font-medium bg-white
                   border-2 border-slate-200 rounded-2xl outline-none
                   transition-all duration-200 text-slate-900
                   placeholder:text-slate-400 placeholder:font-normal
                   focus:border-blue-500 focus:ring-4 focus:ring-blue-50
                   shadow-sm hover:border-slate-300"
        style={{ minHeight: "56px" }}
      />

      {localValue && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center
                     justify-center rounded-full bg-slate-100 hover:bg-slate-200
                     transition-colors active:scale-95"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      )}
    </div>
  );
}