"use client";

import { useState, useEffect, useCallback } from "react";
import { soListDB } from "@/lib/offline-db";
import type { SOListRow } from "@/types/sheets";

interface UseSOListReturn {
  soList: SOListRow[];
  filteredList: SOListRow[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refetch: () => void;
  isFromCache: boolean;
}

export function useSOList(): UseSOListReturn {
  const [soList, setSoList] = useState<SOListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchSOList = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Read online status fresh at call time (avoids stale closure)
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const response = await fetch("/api/sheets/so-list");
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const json = await response.json();
        if (!json.success) throw new Error(json.error ?? "Unknown error");

        setSoList(json.data);
        setIsFromCache(false);

        // Cache in IndexedDB for offline use
        await soListDB.set(json.data);
      } catch (err) {
        // API failed — fall back to IndexedDB cache
        try {
          const cached = await soListDB.get();
          if (cached && cached.data.length > 0) {
            setSoList(cached.data);
            setIsFromCache(true);
          } else {
            setError(
              err instanceof Error ? err.message : "Failed to load SO list"
            );
          }
        } catch {
          setError(
            err instanceof Error ? err.message : "Failed to load SO list"
          );
        }
      }
    } else {
      // Offline — read from IndexedDB only
      try {
        const cached = await soListDB.get();
        if (cached && cached.data.length > 0) {
          setSoList(cached.data);
          setIsFromCache(true);
        } else {
          setError("You are offline and no cached data is available.");
        }
      } catch {
        setError("Failed to read offline cache.");
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSOList();
  }, [fetchSOList]);

  // %name% search — case insensitive, partial match
  const filteredList = soList.filter((so) => {
    if (!searchQuery.trim()) return true;
    return so.so.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  return {
    soList,
    filteredList,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch: fetchSOList,
    isFromCache,
  };
}