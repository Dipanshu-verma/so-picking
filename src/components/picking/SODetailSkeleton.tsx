export function SODetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Loading SO details..." aria-busy="true">
      {/* Header card */}
      <div className="warehouse-card space-y-3">
        <div className="h-6 bg-gray-200 rounded-md w-1/3" />
        <div className="h-4 bg-gray-100 rounded-md w-1/2" />
        <div className="h-3 bg-gray-100 rounded-full w-full mt-3" />
        <div className="flex justify-between">
          <div className="h-10 bg-gray-100 rounded-md w-1/3" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
      </div>

      {/* Location cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border-2 border-gray-100 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="h-5 bg-gray-200 rounded-md w-2/5" />
          </div>
          <div className="pl-8 space-y-1.5">
            <div className="h-4 bg-gray-100 rounded-md w-3/5" />
            <div className="h-3 bg-gray-100 rounded-md w-1/4" />
          </div>
          <div className="pl-8 flex gap-4">
            <div className="h-8 bg-gray-100 rounded-md w-12" />
            <div className="h-8 bg-gray-100 rounded-md w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}