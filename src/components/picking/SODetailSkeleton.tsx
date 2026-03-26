export function SODetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Loading SO details..." aria-busy="true">
      {/* Header card */}
      <div className="warehouse-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 skeleton rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-7 skeleton rounded-lg w-2/5" />
            <div className="h-4 skeleton rounded-lg w-1/3" />
          </div>
        </div>
        <div className="h-3 skeleton rounded-full w-full" />
        <div className="flex justify-between items-center">
          <div className="h-10 skeleton rounded-lg w-1/4" />
          <div className="h-10 skeleton rounded-lg w-1/4" />
          <div className="h-10 skeleton rounded-lg w-1/4" />
        </div>
      </div>

      {/* Section label */}
      <div className="h-4 skeleton rounded-lg w-1/4 mx-1" />

      {/* Location cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border-2 border-slate-100 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full skeleton shrink-0" />
            <div className="h-5 skeleton rounded-lg w-2/5" />
          </div>
          <div className="pl-9 space-y-2">
            <div className="h-4 skeleton rounded-lg w-3/5" />
            <div className="h-3 skeleton rounded-lg w-1/4" />
          </div>
          <div className="pl-9 flex gap-5">
            <div className="h-10 skeleton rounded-lg w-14" />
            <div className="h-10 skeleton rounded-lg w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}