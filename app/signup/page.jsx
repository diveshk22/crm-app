"use client";

import { useState } from "react";
import { signUp } from "@/services/authService";
import Link from "next/link";
import styles from "./signup.module.css";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", workspaceName: "" });

  const handleSignup = async () => {
    try {
      await signUp(form);
      alert("Account Created ✅ Please log in.");
      setForm({ name: "", email: "", password: "", workspaceName: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>My CRM</div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start managing your team today</p>

        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input
            placeholder="John Doe"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Workspace Name</label>
          <input
            placeholder="My Company"
            className="input"
            value={form.workspaceName}
            onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
          />
        </div>

        <button className={styles.btn} onClick={handleSignup}>
          Create Account
        </button>

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
