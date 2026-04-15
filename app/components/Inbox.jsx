"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { sendMessage } from "@/services/sendMessage";
import { buildThreads } from "@/services/buildThreads";
import styles from "./inbox.module.css";

export default function Inbox({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!projectId) {
      supabase.from("projects").select("id, name")
        .then(({ data }) => setProjects(data || []));
    }
  }, [projectId]);

  useEffect(() => {
    if (!selectedProject) return;
    loadMessages();
    const channel = supabase
      .channel(`inbox-${selectedProject}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `project_id=eq.${selectedProject}`,
      }, (payload) => setMessages((prev) => [...prev, payload.new]))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedProject]);

  useEffect(() => {
    const channel = supabase.channel("notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {})
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function loadMessages() {
    const { data } = await supabase.from("messages").select("*")
      .eq("project_id", selectedProject).order("created_at", { ascending: true });
    setMessages(data || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleSend() {
    if (!text.trim() || !selectedProject) return;
    const res = await sendMessage({ project_id: selectedProject, content: text.trim() });
    if (!res) return;
    setText("");
    setReplyTo(null);
    loadMessages();
  }

  const { threads, replies } = buildThreads(messages);

  function renderContent(content) {
    return content.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className={styles.mention}>{part}</span>
      ) : part
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div className={styles.inboxHeader}>
        <h2 className={styles.inboxTitle}>💬 Team Inbox</h2>
        {!projectId && (
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="input"
            style={{ width: "auto" }}
          >
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Thread List */}
      <div className={styles.threadList}>
        {!selectedProject && (
          <p className={styles.empty}>Select a project to view discussions</p>
        )}

        {threads.map((msg) => (
          <div key={msg.id} className={styles.thread}>
            <div className={styles.threadRoot}>
              <div className={styles.threadMeta}>
                <span className={styles.userId}>{msg.user_id}</span>
                <span className={styles.messageText}>{renderContent(msg.content)}</span>
              </div>
              <button
                onClick={() => setReplyTo({ id: msg.id, content: msg.content })}
                className={styles.btnReply}
              >
                ↩ Reply
              </button>
            </div>

            {replies(msg.id).length > 0 && (
              <div className={styles.replies}>
                {replies(msg.id).map((r) => (
                  <div key={r.id} className={styles.reply}>
                    <span className={styles.userId}>{r.user_id} </span>
                    {renderContent(r.content)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {selectedProject && threads.length === 0 && (
          <p className={styles.empty}>No messages yet. Start the discussion! 🚀</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply Banner */}
      {replyTo && (
        <div className={styles.replyBanner}>
          <span>↩ Replying to: <em>&ldquo;{replyTo.content.slice(0, 60)}&rdquo;</em></span>
          <button onClick={() => setReplyTo(null)} className={styles.btnDismiss}>✕</button>
        </div>
      )}

      {/* Input */}
      <div className={styles.inputRow}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={replyTo ? "Write a reply… (@username to mention)" : "Write a message… (@username to mention)"}
          className="input"
          disabled={!selectedProject}
        />
        <button onClick={handleSend} disabled={!selectedProject} className={styles.btnSend}>
          Send
        </button>
      </div>
    </div>
  );
}
