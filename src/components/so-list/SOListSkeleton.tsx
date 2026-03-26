export function SOListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading orders..." aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="warehouse-card"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-4">
            {/* Icon placeholder */}
            <div className="w-12 h-12 rounded-xl skeleton shrink-0" />

            {/* Content placeholders */}
            <div className="flex-1 space-y-2.5">
              <div className="h-5 skeleton rounded-lg w-2/5" />
              <div className="h-3.5 skeleton rounded-lg w-1/3" />
              <div className="flex gap-2 mt-1">
                <div className="h-5 skeleton rounded-full w-20" />
              </div>
            </div>

            {/* Chevron placeholder */}
            <div className="w-8 h-8 rounded-full skeleton shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}