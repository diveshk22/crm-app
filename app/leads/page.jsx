"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { updateLeadStatus } from "@/services/leadService";
import Sidebar from "@/app/components/Sidebar";
import { useOfflineData } from "@/lib/useOfflineData";
import { useOfflineMutation } from "@/lib/useOfflineMutation";
import styles from "./leads.module.css";

export default function LeadsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "New" });

  const fetcher = useCallback(() =>
    supabase.from("leads").select("*").order("created_at", { ascending: false }).then(r => r.data || []),
  []);
  const { data: leads, fromCache, reload } = useOfflineData("leads", fetcher);
  const mutate = useOfflineMutation();

  const handleSubmit = async () => {
    if (!form.name) return;
    const result = await mutate({ type: "insert", table: "leads", payload: form });
    setForm({ name: "", email: "", phone: "", status: "New" });
    if (!result?.queued) reload();
  };

  const handleStatusChange = async (id, status) => {
    const result = await mutate({ type: "update", table: "leads", id, payload: { status } });
    if (!result?.queued) reload();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className={styles.page} style={{ flex: 1 }}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>📋 Lead Management</h1>
          {fromCache && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
              📦 Showing cached data — you're offline. Changes will sync when reconnected.
            </p>
          )}

          {/* Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Add New Lead</h2>
            <input placeholder="Name" value={form.name} className="input"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Email" value={form.email} className="input"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Phone" value={form.phone} className="input"
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select value={form.status} className="input"
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>New</option>
              <option>Contacted</option>
              <option>Closed</option>
            </select>
            <button onClick={handleSubmit} className={styles.btnSave}>
              {fromCache ? "💾 Save (will sync later)" : "Save Lead"}
            </button>
          </div>

          {/* Leads List */}
          <h3 className={styles.sectionTitle}>All Leads</h3>
          {leads.length === 0 ? (
            <p className={styles.empty}>No leads yet. Add your first one above.</p>
          ) : (
            <div className={styles.leadList}>
              {leads.map((lead) => (
                <div key={lead.id} className={styles.leadCard}>
                  <div className={styles.leadInfo}>
                    <span className={styles.leadName}>{lead.name}</span>
                    <span className={styles.leadEmail}>{lead.email}</span>
                    <span className={styles.leadPhone}>{lead.phone}</span>
                  </div>
                  <select value={lead.status} className="input" style={{ width: "auto" }}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Closed</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
