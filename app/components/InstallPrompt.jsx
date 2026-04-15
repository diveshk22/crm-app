"use client";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "16px 20px", zIndex: 9998,
      display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "var(--shadow-lg)", maxWidth: "320px", width: "90%",
    }}>
      <span style={{ fontSize: "24px" }}>📱</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>Install My CRM</div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Add to home screen for offline access</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <button onClick={install} style={{
          background: "var(--accent)", color: "#fff", border: "none",
          borderRadius: "var(--radius-sm)", padding: "6px 12px",
          fontSize: "12px", fontWeight: 600, cursor: "pointer",
        }}>Install</button>
        <button onClick={() => setShow(false)} style={{
          background: "transparent", color: "var(--text-muted)", border: "none",
          fontSize: "11px", cursor: "pointer",
        }}>Dismiss</button>
      </div>
    </div>
  );
}
