"use client";

import Inbox from "@/app/components/Inbox";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import styles from "../components/inbox.module.css";

export default function InboxPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className={styles.page} style={{ flex: 1 }}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>📬 Team Inbox</h1>
        </div>
        <div className={styles.chatBox}>
          <Inbox />
        </div>
      </div>
      </div>
    </div>
  );
}
