import { supabase } from "@/lib/supabase";
import { handleMentions } from "./handleMentions";

export async function sendMessage({ project_id, content }) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ project_id, content }])
    .select()
    .single();

  if (error) {
    console.log("SEND MESSAGE ERROR:", error);
    return null;
  }

  await handleMentions(data);
  return data;
}
