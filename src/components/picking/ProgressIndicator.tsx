interface ProgressIndicatorProps {
  completed: number;
  total: number;
  errors?: number;
}

export function ProgressIndicator({ completed, total, errors = 0 }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-gray-900">{completed}</span>
        <span className="text-lg text-gray-400 font-medium">/ {total}</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 font-medium leading-tight">locations</span>
        <span className="text-xs text-gray-400 leading-tight">picked</span>
      </div>

      {errors > 0 && (
        <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full
                         bg-red-100 text-red-700 text-xs font-bold border border-red-200">
          {errors} error{errors !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}