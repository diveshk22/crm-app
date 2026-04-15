"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Wraps a Supabase fetch with localStorage caching.
 * Returns cached data immediately when offline.
 *
 * Usage:
 *   const { data, loading, fromCache } = useOfflineData("tasks", () =>
 *     supabase.from("tasks").select("*").then(r => r.data || [])
 *   );
 */
export function useOfflineData(cacheKey, fetcher) {
  const key = `crm_cache_${cacheKey}`;

  const readCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [key]);

  const [data, setData] = useState(() => readCache() ?? []);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async () => {
    if (!navigator.onLine) {
      const cached = readCache();
      setData(cached ?? []);
      setFromCache(true);
      setLoading(false);
      return;
    }
    try {
      const result = await fetcher();
      setData(result ?? []);
      setFromCache(false);
      try { localStorage.setItem(key, JSON.stringify(result ?? [])); } catch {}
    } catch {
      const cached = readCache();
      setData(cached ?? []);
      setFromCache(true);
    } finally {
      setLoading(false);
    }
  }, [fetcher, key, readCache]);

  useEffect(() => {
    load();
    const onOnline = () => load();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [load]);

  return { data, loading, fromCache, reload: load };
}
