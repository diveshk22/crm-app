"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useOfflineData } from "@/lib/useOfflineData";
import { useOfflineMutation } from "@/lib/useOfflineMutation";
import styles from "./tasks.module.css";

function TasksContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("projectName");

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [team, setTeam] = useState("");
  const [file, setFile] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});

  const fetcher = useCallback(() => {
    let query = supabase.from("tasks").select("*");
    if (projectId) query = query.eq("project_id", projectId);
    return query.then(r => r.data || []);
  }, [projectId]);

  const cacheKey = projectId ? `tasks_${projectId}` : "tasks";
  const { data: tasks, fromCache, reload: reloadTasks } = useOfflineData(cacheKey, fetcher);
  const mutate = useOfflineMutation();

  const fetchComments = useCallback(async (tasksList) => {
    if (!tasksList?.length || !navigator.onLine) return;
    const ids = tasksList.map((t) => t.id);
    const { data, error } = await supabase
      .from("task_comments").select("*").in("task_id", ids)
      .order("created_at", { ascending: true });
    if (error) return;
    const grouped = {};
    data?.forEach((c) => {
      if (!grouped[c.task_id]) grouped[c.task_id] = [];
      grouped[c.task_id].push(c);
    });
    setComments(grouped);
  }, []);

  useEffect(() => { fetchComments(tasks); }, [tasks, fetchComments]);

  const addTask = async () => {
    if (!title) return alert("Enter task title");
    let fileUrl = null;
    if (file && navigator.onLine) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from("task-files").upload(fileName, file);
      if (!error && data) {
        fileUrl = supabase.storage.from("task-files").getPublicUrl(fileName).data.publicUrl;
      }
    }
    const result = await mutate({ type: "insert", table: "tasks", payload: {
      title, project_id: projectId, status: "todo",
      priority, due_date: dueDate, assignee_id: assignee, team_id: team, attachment: fileUrl,
    }});
    setTitle(""); setPriority("medium"); setDueDate(""); setAssignee(""); setTeam(""); setFile(null);
    if (!result?.queued) reloadTasks();
  };

  const toggleStatus = async (task) => {
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    const result = await mutate({ type: "update", table: "tasks", id: task.id, payload: { status: next } });
    if (!result?.queued) reloadTasks();
  };

  const deleteTask = async (id) => {
    const result = await mutate({ type: "delete", table: "tasks", id });
    if (!result?.queued) reloadTasks();
  };

  const addComment = async (taskId) => {
    const text = commentText[taskId];
    if (!text?.trim()) { alert("Empty comment"); return; }
    const { data, error } = await supabase
      .from("comments")
      .insert([{ task_id: taskId, comment: text.trim(), created_at: new Date().toISOString() }])
      .select();
    if (error) { alert("Error: " + error.message); return; }
    setCommentText((prev) => ({ ...prev, [taskId]: "" }));
    setComments((prev) => ({ ...prev, [taskId]: [...(prev[taskId] || []), data[0]] }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>✅ Tasks</h1>
        {fromCache && (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
            📦 Showing cached data — you're offline. Changes will sync when reconnected.
          </p>
        )}
        {projectName && (
          <p className={styles.projectLabel}>
            Project: <span>{projectName}</span>
          </p>
        )}

        {/* Create Task */}
        <div className={styles.formCard}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title…" className="input" />
          <div className={styles.formRow}>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
            <input placeholder="Assign user" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="input" />
            <input placeholder="Team" value={team} onChange={(e) => setTeam(e.target.value)} className="input" />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="input" />
          </div>
          <button onClick={addTask} className={styles.btnCreate}>➕ Create Task</button>
        </div>

        {/* Task List */}
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div>
                  <p className={styles.taskTitle}>{task.title}</p>
                  <p className={styles.taskMeta}>Priority: {task.priority} · Due: {task.due_date || "N/A"}</p>
                </div>
                <div className={styles.taskActions}>
                  <button
                    onClick={() => toggleStatus(task)}
                    className={styles.btnStatus}
                    data-status={task.status}
                  >
                    {task.status}
                  </button>
                  <button onClick={() => deleteTask(task.id)} className={styles.btnDelete}>🗑</button>
                </div>
              </div>

              {task.attachment && (
                <a href={task.attachment} target="_blank" className={styles.attachment}>📎 Attachment</a>
              )}

              <div className={styles.commentSection}>
                <div className={styles.commentRow}>
                  <input
                    value={commentText[task.id] || ""}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [task.id]: e.target.value }))}
                    placeholder="Add comment…"
                    className="input"
                  />
                  <button onClick={() => addComment(task.id)} className={styles.btnSend}>Send</button>
                </div>
                <div className={styles.commentList}>
                  {(comments[task.id] || []).map((c) => (
                    <p key={c.id} className={styles.comment}>💬 {c.comment}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className={styles.empty}>No tasks yet. Create one 🚀</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense>
      <TasksContent />
    </Suspense>
  );
}
