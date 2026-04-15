import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  process.env.PROJECT_URL,
  process.env.SERVICE_ROLE_KEY
);

Deno.serve(async (_req: Request) => {
  const today = new Date().toISOString();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .lte("due_date", today)
    .eq("status", "pending");

  if (error) {
    console.error("Fetch error:", error);
    return new Response("Error fetching tasks", { status: 500 });
  }

  if (!tasks || tasks.length === 0) {
    return new Response("No tasks due", { status: 200 });
  }

  const notifications = tasks.map((task) => ({
    user_id: task.assigned_to,
    type: "deadline",
    title: "Deadline Reminder",
    message: `${task.title} is due soon`,
  }));

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error("Insert error:", insertError);
    return new Response("Error inserting notifications", { status: 500 });
  }

  return new Response("Done", { status: 200 });
});
