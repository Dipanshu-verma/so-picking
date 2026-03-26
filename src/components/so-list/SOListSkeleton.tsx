export function SOListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading orders..." aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="warehouse-card animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2.5">
              {/* SO number */}
              <div className="h-5 bg-gray-200 rounded-md w-2/5" />
              {/* Date */}
              <div className="h-4 bg-gray-100 rounded-md w-1/3" />
              {/* Status badge */}
              <div className="flex gap-2 mt-1">
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
            </div>
            {/* Chevron */}
            <div className="w-5 h-5 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}