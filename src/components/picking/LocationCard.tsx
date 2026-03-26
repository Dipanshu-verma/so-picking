import { CheckCircle2, XCircle, Clock, Package } from "lucide-react";
import { LocationStatus } from "@/constants";
import type { LocationGroup } from "@/types/picking";

interface LocationCardProps {
  location: LocationGroup;
  index: number;
  isActive?: boolean;
}

const STATUS_CONFIG: Record<
  LocationStatus,
  { icon: React.ReactNode; label: string; cardStyle: string; badgeStyle: string }
> = {
  [LocationStatus.PENDING]: {
    icon: <Clock className="w-5 h-5 text-gray-400" aria-hidden="true" />,
    label: "Pending",
    cardStyle: "border-gray-200 bg-white",
    badgeStyle: "bg-gray-100 text-gray-600 border-gray-200",
  },
  [LocationStatus.PALLET_SCANNED]: {
    icon: <Package className="w-5 h-5 text-blue-500" aria-hidden="true" />,
    label: "In Progress",
    cardStyle: "border-blue-300 bg-blue-50",
    badgeStyle: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [LocationStatus.COMPLETED]: {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />,
    label: "Picked",
    cardStyle: "border-green-200 bg-green-50",
    badgeStyle: "bg-green-100 text-green-700 border-green-200",
  },
  [LocationStatus.ERROR]: {
    icon: <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />,
    label: "Error",
    cardStyle: "border-red-200 bg-red-50",
    badgeStyle: "bg-red-100 text-red-700 border-red-200",
  },
};

export function LocationCard({ location, index, isActive = false }: LocationCardProps) {
  const config = STATUS_CONFIG[location.status];

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-200
                  ${config.cardStyle}
                  ${isActive ? "ring-2 ring-blue-400 ring-offset-2 shadow-md" : ""}
                 `}
      aria-label={`Location ${location.location}, status: ${config.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: location info */}
        <div className="flex-1 min-w-0">
          {/* Index + Location name */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs
                             font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <p className="text-base font-bold text-gray-900 truncate">
              {location.location}
            </p>
            {isActive && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-600 text-white
                               text-xs font-semibold">
                Active
              </span>
            )}
          </div>

          {/* SKU info */}
          <div className="mt-2 pl-8 space-y-0.5">
            <p className="text-sm font-semibold text-gray-700 truncate">
              {location.skuName}
            </p>
            <p className="text-xs text-gray-400 font-mono">{location.sku}</p>
          </div>

          {/* Quantity */}
          <div className="mt-2.5 pl-8 flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">Qty</span>
              <p className="text-lg font-black text-gray-900 leading-tight">
                {location.quantity}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">Tag</span>
              <p className="text-sm font-mono font-semibold text-gray-700 leading-tight">
                {location.tag}
              </p>
            </div>
          </div>
        </div>

        {/* Right: status icon + badge */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {config.icon}
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badgeStyle}`}>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}