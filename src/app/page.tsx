"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { RefreshCw, PackageSearch, WifiOff } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SOSearch } from "@/components/so-list/SOSearch";
import { SOCard } from "@/components/so-list/SOCard";
import { SOListSkeleton } from "@/components/so-list/SOListSkeleton";
import { useSOList } from "@/hooks/useSOList";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePickingStore } from "@/store/picking-store";
export default function HomePage() {
  const {
    filteredList,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
    isFromCache,
  } = useSOList();

  const parentRef = useRef<HTMLDivElement>(null);

  // Virtual list — only renders visible items when list > 100
  const virtualizer = useVirtualizer({
    count: filteredList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 112, // Approximate height of each SOCard in px
    overscan: 5,             // Render 5 extra items above/below viewport
  });

  const useVirtual = filteredList.length > 100;

  const router = useRouter();
const activeSO = usePickingStore((s) => s.activeSO);
const [hasHydrated, setHasHydrated] = useState(false);

useEffect(() => {
  const unsubscribe = usePickingStore.persist.onFinishHydration(() => {
    setHasHydrated(true);
  });

  if (usePickingStore.persist.hasHydrated()) {
    setHasHydrated(true);
  }

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!hasHydrated) return;
  if (activeSO) {
    // IN_PROGRESS order exists — land directly on picking page
    router.replace(`/so/${encodeURIComponent(activeSO.soId)}/picking`);
  }
}, [hasHydrated, activeSO, router]);

// Show nothing while checking for active SO to avoid flash of home screen
if (!hasHydrated) return null;
if (activeSO) return null;


  return (
    <div className="min-h-screen bg-warehouse-bg">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8">
        {/* Search */}
        <div className="my-4">
          <SOSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Offline cache notice */}
        {isFromCache && (
          <div
            className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200
                          rounded-xl px-4 py-3 text-amber-700 text-sm"
          >
            <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Showing cached data — connect to refresh.</span>
            <button
              onClick={refetch}
              className="ml-auto text-amber-700 underline text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && <SOListSkeleton count={5} />}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center py-16 gap-5">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <RefreshCw className="w-9 h-9 text-red-400" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">
                Failed to load
              </p>
              <p className="text-gray-500 mt-1 text-sm">{error}</p>
            </div>
            <button onClick={refetch} className="warehouse-button-primary px-10">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredList.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <PackageSearch className="w-9 h-9 text-gray-400" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-semibold text-lg">
                {searchQuery.trim()
                  ? `No results for "${searchQuery}"`
                  : "No pending orders"}
              </p>
              <p className="text-gray-400 mt-1 text-sm">
                {searchQuery.trim()
                  ? "Try a different search term"
                  : "All orders are up to date"}
              </p>
            </div>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="warehouse-button-secondary px-8"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* SO List — virtual when > 100 items, normal otherwise */}
        {!isLoading && !error && filteredList.length > 0 && (
          <>
            <p className="text-sm text-gray-500 px-1 mb-3">
              {filteredList.length} order
              {filteredList.length !== 1 ? "s" : ""} pending
            </p>

            {useVirtual ? (
              // ── Virtual list for large datasets ──────────────────
              <div
                ref={parentRef}
                className="overflow-auto"
                style={{ height: "calc(100vh - 200px)" }}
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualItem.start}px)`,
                        paddingBottom: "12px",
                      }}
                    >
                      <SOCard so={filteredList[virtualItem.index]} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // ── Normal list for small datasets ────────────────────
              <div className="space-y-3">
                {filteredList.map((so) => (
                  <SOCard key={so.so} so={so} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}