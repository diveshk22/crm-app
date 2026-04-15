"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.brand}>My CRM</h2>
        <div className={styles.navButtons}>
          <Link href="/login">
            <button className={styles.btnOutline}>Login</button>
          </Link>
          <Link href="/signup">
            <button className={styles.btnPrimary}>Sign Up</button>
          </Link>
        </div>
      </header>

      <div className={styles.hero}>
        <main className={styles.card}>
          <span className={styles.badge}>✨ All-in-one CRM Platform</span>

          <h1 className={styles.heading}>
            Welcome to <span>My CRM</span> 🚀
          </h1>

          <p className={styles.description}>
            Manage your leads, inbox, and team in one place. Start building your
            SaaS CRM today.
          </p>

          <div className={styles.features}>
            <span className={styles.pill}>📋 Lead Management</span>
            <span className={styles.pill}>📥 Inbox</span>
            <span className={styles.pill}>✅ Tasks</span>
            <span className={styles.pill}>📁 Projects</span>
          </div>

          <div className={styles.ctaButtons}>
            <Link href="/signup">
              <button className={styles.btnCta}>Get Started</button>
            </Link>
            <Link href="/signup">
              <button className={styles.btnCtaOutline}>Create Account</button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
