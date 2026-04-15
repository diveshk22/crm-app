"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/authService";
import styles from "./sidebar.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/leads", label: "Leads", icon: "📋" },
  { href: "/inbox", label: "Inbox", icon: "📬" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>My CRM</div>
      <nav className={styles.nav}>
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${pathname === href ? styles.active : ""}`}
          >
            <span className={styles.icon}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      <button className={styles.logout} onClick={handleLogout}>
        <span>🚪</span> Logout
      </button>
    </aside>
  );
}
