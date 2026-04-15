"use client";

import { useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/app/components/Sidebar";
import { useOfflineData } from "@/lib/useOfflineData";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const { data: tasks, fromCache: tasksCached } = useOfflineData("tasks", useCallback(() =>
    supabase.from("tasks").select("*").then(r => r.data || []), []));
  const { data: projects } = useOfflineData("projects", useCallback(() =>
    supabase.from("projects").select("*").then(r => r.data || []), []));
  const { data: leads } = useOfflineData("leads", useCallback(() =>
    supabase.from("leads").select("*").then(r => r.data || []), []));

  const completed = tasks.filter((t) => t.status === "done").length;
  const pending = tasks.filter((t) => t.status !== "done").length;
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>Welcome back 👋</h1>
          <p className={styles.subtitle}>Here's what's happening with your workspace today.</p>
          {tasksCached && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
              📦 Showing cached data — you're offline
            </p>
          )}
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statAccent}`}>
            <span className={styles.statIcon}>📁</span>
            <span className={styles.statValue}>{projects.length}</span>
            <span className={styles.statLabel}>Total Projects</span>
          </div>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <span className={styles.statIcon}>✅</span>
            <span className={styles.statValue}>{completed}</span>
            <span className={styles.statLabel}>Completed Tasks</span>
          </div>
          <div className={`${styles.statCard} ${styles.statYellow}`}>
            <span className={styles.statIcon}>⏳</span>
            <span className={styles.statValue}>{pending}</span>
            <span className={styles.statLabel}>Pending Tasks</span>
          </div>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <span className={styles.statIcon}>📋</span>
            <span className={styles.statValue}>{leads.length}</span>
            <span className={styles.statLabel}>Total Leads</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/projects" className={styles.actionCard}>
              <span className={styles.actionIcon}>📁</span>
              <span className={styles.actionLabel}>Projects</span>
              <span className={styles.actionDesc}>Create & manage projects</span>
            </Link>
            <Link href="/leads" className={styles.actionCard}>
              <span className={styles.actionIcon}>📋</span>
              <span className={styles.actionLabel}>Leads</span>
              <span className={styles.actionDesc}>Track your leads pipeline</span>
            </Link>
            <Link href="/inbox" className={styles.actionCard}>
              <span className={styles.actionIcon}>📬</span>
              <span className={styles.actionLabel}>Inbox</span>
              <span className={styles.actionDesc}>Team messages & threads</span>
            </Link>
            <Link href="/tasks" className={styles.actionCard}>
              <span className={styles.actionIcon}>✅</span>
              <span className={styles.actionLabel}>Tasks</span>
              <span className={styles.actionDesc}>View all tasks</span>
            </Link>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p className={styles.empty}>No tasks yet.</p>
          ) : (
            <div className={styles.taskList}>
              {recentTasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <span className={styles.taskName}>{task.title || task.name || "Untitled"}</span>
                  <span className={`${styles.badge} ${task.status === "done" ? styles.badgeDone : styles.badgePending}`}>
                    {task.status === "done" ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
