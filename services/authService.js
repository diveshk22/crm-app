import { supabase } from "@/lib/supabase";
import { supabaseBrowser } from "@/lib/supabase-browser";

export async function signUp({ email, password, name, workspaceName }) {
  const { data, error } = await supabaseBrowser.auth.signUp({ email, password });
  if (error) throw error;

  const user = data.user;

  await supabase.from("users").insert([{ id: user.id, email, name }]);

  const { data: workspace } = await supabase
    .from("workspaces")
    .insert([{ name: workspaceName, created_by: user.id }])
    .select()
    .single();

  await supabase.from("workspace_members").insert([
    { workspace_id: workspace.id, user_id: user.id, role: "owner" },
  ]);

  return user;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  await supabaseBrowser.auth.signOut();
}

export async function getCurrentUserWithWorkspace() {
  const { data: userData } = await supabaseBrowser.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .single();

  return { user, workspace_id: member?.workspace_id };
}
