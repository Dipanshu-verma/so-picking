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

  // Sync external value changes into local state
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
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />

      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder="Search Sales Order..."
        autoComplete="off"
        aria-label="Search Sales Orders"
        className="w-full pl-12 pr-12 py-4 text-base bg-white border-2 border-gray-200 
                   rounded-xl outline-none transition-colors duration-150
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                   placeholder-gray-400 text-gray-900"
      />

      {localValue && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center 
                     justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}