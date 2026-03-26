"use client";

import { Package } from "lucide-react";
import { OnlineStatus } from "@/components/common/OnlineStatus";
import { APP_META } from "@/constants";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export function Header({ title, showBack, onBack, rightSlot }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 
                 shadow-sm safe-bottom"
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: back button or logo */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 flex items-center justify-center rounded-xl 
                         hover:bg-gray-100 transition-colors shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
          )}

          <h1 className="text-lg font-bold text-gray-900 truncate">
            {title ?? APP_META.SHORT_NAME}
          </h1>
        </div>

        {/* Right: custom slot or online status */}
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot ?? <OnlineStatus />}
        </div>
      </div>
    </header>
  );
}