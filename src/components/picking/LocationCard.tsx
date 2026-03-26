import { CheckCircle2, XCircle, Clock, Package, MapPin } from "lucide-react";
import { LocationStatus } from "@/constants";
import type { LocationGroup } from "@/types/picking";

interface LocationCardProps {
  location: LocationGroup;
  index: number;
  isActive?: boolean;
}

const STATUS_CONFIG: Record<
  LocationStatus,
  { icon: React.ReactNode; label: string; cardStyle: React.CSSProperties; badgeStyle: string; numberStyle: string }
> = {
  [LocationStatus.PENDING]: {
    icon: <Clock className="w-5 h-5 text-slate-400" aria-hidden="true" />,
    label: "Pending",
    cardStyle: { borderColor: "#e2e8f0", background: "#fff" },
    badgeStyle: "badge badge-pending",
    numberStyle: "bg-slate-100 text-slate-500",
  },
  [LocationStatus.PALLET_SCANNED]: {
    icon: <Package className="w-5 h-5 text-blue-500" aria-hidden="true" />,
    label: "In Progress",
    cardStyle: { borderColor: "#bfdbfe", background: "#eff6ff" },
    badgeStyle: "badge badge-progress",
    numberStyle: "bg-blue-100 text-blue-700",
  },
  [LocationStatus.COMPLETED]: {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />,
    label: "Picked",
    cardStyle: { borderColor: "#bbf7d0", background: "#f0fdf4" },
    badgeStyle: "badge badge-success",
    numberStyle: "bg-green-100 text-green-700",
  },
  [LocationStatus.ERROR]: {
    icon: <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />,
    label: "Error",
    cardStyle: { borderColor: "#fecdd3", background: "#fff1f2" },
    badgeStyle: "badge badge-error",
    numberStyle: "bg-red-100 text-red-700",
  },
};

export function LocationCard({ location, index, isActive = false }: LocationCardProps) {
  const config = STATUS_CONFIG[location.status];
  const isCompleted = location.status === LocationStatus.COMPLETED;

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all duration-300
                  ${isActive ? "ring-2 ring-blue-400 ring-offset-2" : ""}
                 `}
      style={{
        ...config.cardStyle,
        boxShadow: isActive
          ? "0 4px 20px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.05)",
      }}
      aria-label={`Location ${location.location}, status: ${config.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: location info */}
        <div className={`flex-1 min-w-0 ${isCompleted ? "opacity-70" : ""}`}>
          {/* Index + Location name */}
          <div className="flex items-center gap-2.5">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                           text-xs font-black ${config.numberStyle}`}
            >
              {index + 1}
            </span>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <p className={`text-base font-black text-slate-900 truncate ${isCompleted ? "line-through text-slate-500" : ""}`}>
                {location.location}
              </p>
            </div>
            {isActive && (
              <span
                className="shrink-0 px-2.5 py-0.5 rounded-full
                           text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
              >
                Active
              </span>
            )}
          </div>

          {/* SKU info */}
          <div className="mt-2.5 pl-9 space-y-0.5">
            <p className="text-sm font-semibold text-slate-700 truncate">
              {location.skuName}
            </p>
            <p className="text-xs text-slate-400 font-mono tracking-wide">{location.sku}</p>
          </div>

          {/* Quantity + Tag */}
          <div className="mt-3 pl-9 flex items-center gap-5">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Qty</span>
              <p className="text-2xl font-black text-slate-900 leading-tight tabular-nums">
                {location.quantity}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Tag</span>
              <p className="text-sm font-mono font-bold text-slate-700 leading-tight mt-0.5">
                {location.tag}
              </p>
            </div>
          </div>
        </div>

        {/* Right: status icon + badge */}
        <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
          {config.icon}
          <span className={config.badgeStyle}>{config.label}</span>
        </div>
      </div>
    </div>
  );
}