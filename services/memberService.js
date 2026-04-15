import { supabase } from "@/lib/supabase";

export async function getMembers(projectId) {
  const { data, error } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addMember(projectId, email, role = "user") {
  const { data: existing } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("email", email)
    .maybeSingle();
  if (existing) throw new Error("This email is already a member of this project.");

  const { data, error } = await supabase
    .from("project_members")
    .insert([{ project_id: projectId, email, role }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMemberRole(memberId, role) {
  const { error } = await supabase
    .from("project_members")
    .update({ role })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
}

export async function removeMember(memberId) {
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId);
  if (error) throw new Error(error.message);
}
