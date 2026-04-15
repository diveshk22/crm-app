import { supabase } from "@/lib/supabase";

// ✅ Add Lead
export async function addLead({ name, email, phone, status }) {
  const { data, error } = await supabase
    .from("leads")
    .insert([
      {
        name,
        email,
        phone,
        status,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

// ✅ Get All Leads  🔥 (YEH MISSING THA)
export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ Update Status
export async function updateLeadStatus(id, status) {
  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
  return data;
}
