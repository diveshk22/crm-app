"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  getPendingOperations,
  removeOperation,
} from "@/lib/syncQueue";

export default function SyncStatus() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const refreshCount = useCallback(async () => {
    const ops = await getPendingOperations();
    setPending(ops.length);
  }, []);

  const syncNow = useCallback(async () => {
    const ops = await getPendingOperations();
    if (!ops.length) return;
    setSyncing(true);
    for (const op of ops) {
      try {
        if (op.type === "insert") {
          await supabase.from(op.table).insert(op.payload);
        } else if (op.type === "update") {
          await supabase.from(op.table).update(op.payload).eq("id", op.id);
        } else if (op.type === "delete") {
          await supabase.from(op.table).delete().eq("id", op.id);
        }
        await removeOperation(op.id);
      } catch {
        // leave failed ops in queue for next attempt
      }
    }
    setSyncing(false);
    setLastSynced(new Date());
    await refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    refreshCount();
    const onOnline = () => syncNow();
    window.addEventListener("online", onOnline);
    // expose globally so other modules can enqueue + trigger refresh
    window.__refreshSyncCount = refreshCount;
    return () => window.removeEventListener("online", onOnline);
  }, [syncNow, refreshCount]);

  if (pending === 0 && !syncing) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        right: "16px",
        background: syncing ? "var(--accent)" : "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        zIndex: 9997,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "var(--shadow-md)",
        fontSize: "13px",
        color: syncing ? "#fff" : "var(--text-secondary)",
        cursor: pending > 0 && !syncing ? "pointer" : "default",
        transition: "background 0.2s",
      }}
      onClick={!syncing && pending > 0 ? syncNow : undefined}
      title={pending > 0 ? "Click to sync now" : ""}
    >
      {syncing ? (
        <>
          <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>🔄</span>
          Syncing…
        </>
      ) : (
        <>
          <span>⏳</span>
          {pending} change{pending !== 1 ? "s" : ""} pending sync
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
