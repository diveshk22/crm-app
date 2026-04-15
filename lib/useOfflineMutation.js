"use client";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { enqueueOperation } from "@/lib/syncQueue";

/**
 * Returns a mutate function that:
 *  - Executes immediately against Supabase when online
 *  - Queues the operation in IndexedDB when offline, synced later by SyncStatus
 *
 * Usage:
 *   const mutate = useOfflineMutation();
 *   await mutate({ type: "insert", table: "tasks", payload: { title: "..." } });
 *   await mutate({ type: "update", table: "tasks", id: "uuid", payload: { status: "done" } });
 *   await mutate({ type: "delete", table: "tasks", id: "uuid" });
 */
export function useOfflineMutation() {
  return useCallback(async (op) => {
    if (!navigator.onLine) {
      await enqueueOperation(op);
      // notify SyncStatus to refresh its count
      window.__refreshSyncCount?.();
      return { queued: true };
    }

    let result;
    if (op.type === "insert") {
      result = await supabase.from(op.table).insert(op.payload);
    } else if (op.type === "update") {
      result = await supabase.from(op.table).update(op.payload).eq("id", op.id);
    } else if (op.type === "delete") {
      result = await supabase.from(op.table).delete().eq("id", op.id);
    }

    if (result?.error) throw result.error;
    return result;
  }, []);
}
