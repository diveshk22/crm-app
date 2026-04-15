"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/app/components/Sidebar";
import styles from "./projects.module.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [userName, setUserName] = useState("");
  const [branch, setBranch] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [submitDate, setSubmitDate] = useState("");



  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*");
    if (error) { console.log(error); return; }
    setProjects(data || []);
  };

  useEffect(() => { fetchProjects(); }, []);

  const addProject = async () => {
    if (!title || !userName || !branch || !creatorName || !submitDate) {
      alert("Please fill all fields");
      return;
    }
    const { error } = await supabase.from("projects").insert([
      { name: title, user_name: userName, branch, creator_name: creatorName, submit_date: submitDate },
    ]);
    if (error) { alert(error.message); return; }
    setTitle(""); setUserName(""); setBranch(""); setCreatorName(""); setSubmitDate("");
    fetchProjects();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className={styles.page} style={{ flex: 1 }}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>📁 Project Manager</h1>
          <div className={styles.headerActions}>
            <Link href="/inbox" className={styles.btnBlue}>📬 Team Inbox</Link>
            <Link href="/leads" className={styles.btnGreen}>➕ Leads</Link>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create New Project</h2>
          <div className={styles.formGrid}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project Title" className="input" />
            <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="User Name" className="input" />
            <input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch" className="input" />
            <input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Creator Name" className="input" />
            <input type="date" value={submitDate} onChange={(e) => setSubmitDate(e.target.value)} className="input" />
          </div>
          <button onClick={addProject} className={styles.btnSubmit}>➕ Create Project</button>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <p className={styles.empty}>No projects yet. Create your first one 🚀</p>
        ) : (
          <div className={styles.grid}>
            {projects.map((project) => (
              <div key={project.id} className={styles.projectCard}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <div className={styles.projectMeta}>
                  <span>👤 {project.user_name}</span>
                  <span>🏢 {project.branch}</span>
                  <span>🧑‍💼 {project.creator_name}</span>
                  <span>📅 {project.submit_date}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
                  <Link
                    href={`/projects/${project.id}`}
                    className={styles.btnManage}
                  >
                    🚀 Open Workspace
                  </Link>
                  <Link
                    href={`/tasks?projectId=${project.id}&projectName=${project.name}`}
                    className={styles.btnManage}
                    style={{ background: "var(--green)" }}
                  >
                    ✅ Manage Tasks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
