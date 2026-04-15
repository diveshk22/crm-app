import { supabase } from "@/lib/supabase";
import { extractMentions } from "./extractMentions";
import { createNotification } from "./notify";

export async function handleMentions(message) {
  // 1. Extract usernames from message
  const usernames = extractMentions(message.content);
  if (!usernames.length) return;

  // 2. Get users from DB
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", usernames);

  if (error) {
    console.error("Mention fetch error:", error);
    return;
  }

  if (!users?.length) return;

  // 3. Create notification for each user
  for (const user of users) {
    await createNotification({
      user_id: user.id,
      type: "mention",
      title: "You were mentioned",
      message: message.content,
    });
  }
}
