"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { RefreshCw, PackageSearch, WifiOff, Package2 } from "lucide-react";
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

  const virtualizer = useVirtualizer({
    count: filteredList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 112,
    overscan: 5,
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
      router.replace(`/so/${encodeURIComponent(activeSO.soId)}/picking`);
    }
  }, [hasHydrated, activeSO, router]);

  if (!hasHydrated) return null;
  if (activeSO) return null;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8">

        {/* ── Page title ─────────────────────────────────────────── */}
        <div className="pt-4 pb-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sales Orders
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Select an order to begin picking</p>
        </div>

        {/* ── Search ─────────────────────────────────────────────── */}
        <div className="my-4">
          <SOSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* ── Offline cache notice ────────────────────────────────── */}
        {isFromCache && (
          <div
            className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-amber-800 text-sm
                       border border-amber-200 fade-in"
            style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 text-amber-600" aria-hidden="true" />
            </div>
            <span className="flex-1 font-medium">Showing cached data — connect to refresh.</span>
            <button
              onClick={refetch}
              className="text-amber-700 underline text-sm font-semibold hover:text-amber-900
                         transition-colors shrink-0"
            >
              Refresh
            </button>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────── */}
        {isLoading && <SOListSkeleton count={5} />}

        {/* ── Error ───────────────────────────────────────────────── */}
        {!isLoading && error && (
          <div className="flex flex-col items-center py-16 gap-5 fade-in">
            <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <RefreshCw className="w-9 h-9 text-red-400" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-bold text-xl">Failed to load</p>
              <p className="text-slate-500 mt-1 text-sm">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="warehouse-button warehouse-button-primary px-10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty ───────────────────────────────────────────────── */}
        {!isLoading && !error && filteredList.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-5 fade-in">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <PackageSearch className="w-11 h-11 text-slate-400" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-bold text-xl">
                {searchQuery.trim()
                  ? `No results for "${searchQuery}"`
                  : "No pending orders"}
              </p>
              <p className="text-slate-500 mt-1.5 text-sm">
                {searchQuery.trim()
                  ? "Try a different search term"
                  : "All orders are up to date"}
              </p>
            </div>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="warehouse-button warehouse-button-secondary px-8"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* ── SO List ─────────────────────────────────────────────── */}
        {!isLoading && !error && filteredList.length > 0 && (
          <>
            <div className="flex items-center justify-between px-1 mb-3">
              <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                <Package2 className="w-4 h-4" aria-hidden="true" />
                {filteredList.length} order{filteredList.length !== 1 ? "s" : ""} pending
              </p>
            </div>

            {useVirtual ? (
              <div
                ref={parentRef}
                className="overflow-auto hide-scrollbar"
                style={{ height: "calc(100vh - 220px)" }}
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
              <div className="space-y-3">
                {filteredList.map((so, i) => (
                  <div
                    key={so.so}
                    style={{ "--stagger-delay": `${i * 50}ms` } as React.CSSProperties}
                  >
                    <SOCard so={so} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}