"use client";
export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        gap: "16px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "64px" }}>📡</span>
      <h1 style={{ fontSize: "24px", fontWeight: 700 }}>You're offline</h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: "320px" }}>
        This page isn't cached yet. Go back to a page you've visited before, or
        reconnect to continue.
      </p>
      <button
        onClick={() => window.history.back()}
        style={{
          marginTop: "8px",
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "10px 24px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Go Back
      </button>
    </div>
  );
}
