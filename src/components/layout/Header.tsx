"use client";

import { Package, ChevronLeft } from "lucide-react";
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
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: back button or logo */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 flex items-center justify-center rounded-xl
                         hover:bg-slate-100 transition-colors shrink-0 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" aria-hidden="true" strokeWidth={2.5} />
            </button>
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 3px 10px rgba(37,99,235,0.4)",
              }}
            >
              <Package className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
          )}

          <h1 className="text-[17px] font-bold text-slate-800 truncate tracking-tight">
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