"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Inbox from "@/app/components/Inbox";
import { getMembers, addMember, updateMemberRole, removeMember } from "@/services/memberService";
import { supabase } from "@/lib/supabase";
import styles from "./workspace.module.css";

const ROLES = ["admin", "manager", "user"];

export default function ProjectWorkspace() {
  const { id } = useParams();
  const [tab, setTab] = useState("members");
  const [projectName, setProjectName] = useState("Project");
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await getMembers(id);
      setMembers(data);
    } catch (e) {
      console.error("fetchMembers error:", e?.message || JSON.stringify(e));
    }
  }, [id]);

  useEffect(() => {
    supabase.from("projects").select("name").eq("id", id).single()
      .then(({ data }) => { if (data) setProjectName(data.name); });
    fetchMembers();
  }, [id, fetchMembers]);

  const handleAddMember = async () => {
    if (!email.trim()) return alert("Enter an email address");
    setLoading(true);
    try {
      await addMember(id, email.trim(), role);
      setEmail("");
      setRole("user");
      fetchMembers();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRemove = async (memberId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      alert(e.message);
    }
  };

  const getInitials = (email) => email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <h1 className={styles.projectTitle}>
            📁 <span>{projectName}</span>
          </h1>
          <Link href="/projects" className={styles.backLink}>← All Projects</Link>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            { key: "members", label: "👥 Team Members" },
            { key: "inbox",   label: "💬 Inbox" },
            { key: "tasks",   label: "✅ Tasks" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`${styles.tab} ${tab === key ? styles.tabActive : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Members Tab ── */}
        {tab === "members" && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Add Team Member</h2>

            <div className={styles.addRow}>
              <input
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`input ${styles.roleSelect}`}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
              <button onClick={handleAddMember} disabled={loading} className={styles.btnAdd}>
                {loading ? "Adding…" : "➕ Add Member"}
              </button>
            </div>

            {members.length === 0 ? (
              <p className={styles.empty}>No members yet. Add your first team member above.</p>
            ) : (
              <div className={styles.memberList}>
                {members.map((member) => (
                  <div key={member.id} className={styles.memberRow}>
                    <div className={styles.memberInfo}>
                      <div className={styles.avatar}>{getInitials(member.email)}</div>
                      <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                    <div className={styles.memberActions}>
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={styles.roleSelectInline}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                      <span className={styles.roleBadge} data-role={member.role}>
                        {member.role}
                      </span>
                      <button onClick={() => handleRemove(member.id)} className={styles.btnRemove}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Inbox Tab ── */}
        {tab === "inbox" && (
          <div className={styles.inboxWrap}>
            <Inbox projectId={id} />
          </div>
        )}

        {/* ── Tasks Tab ── */}
        {tab === "tasks" && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Project Tasks</h2>
            <Link
              href={`/tasks?projectId=${id}&projectName=${encodeURIComponent(projectName)}`}
              className={styles.tasksLink}
            >
              ✅ Open Task Board
            </Link>
            <p className={styles.tasksHint}>
              View, create, and manage all tasks for <strong>{projectName}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
