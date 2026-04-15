import { supabase } from "@/lib/supabase";

export async function createNotification({ user_id, type, title, message }) {
  const { data, error } = await supabase.from("notifications").insert([
    {
      user_id,
      type,
      title,
      message,
    },
  ]);

  if (error) {
    console.error("Notification Error:", error);
  }

  return data;
}