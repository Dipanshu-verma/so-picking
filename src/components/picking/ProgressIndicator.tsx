interface ProgressIndicatorProps {
  completed: number;
  total: number;
  errors?: number;
}

export function ProgressIndicator({ completed, total, errors = 0 }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-black text-slate-900 tabular-nums leading-none">
          {completed}
        </span>
        <span className="text-xl text-slate-400 font-semibold">/ {total}</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-slate-600 leading-tight">locations</span>
        <span className="text-xs text-slate-400 leading-tight">picked</span>
      </div>

      {errors > 0 && (
        <span
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                     text-xs font-bold border border-red-200 text-red-700"
          style={{ background: "linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%)" }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          {errors} error{errors !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}