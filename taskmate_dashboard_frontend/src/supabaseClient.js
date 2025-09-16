import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client initialization using environment variables.
 * Ensure these are provided by the orchestrator in the .env file:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY (anon public key)
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY;

// Validate presence of env vars at runtime (dev console warning)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase env vars are missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in .env"
  );
}

/** Exported supabase client to be used across the app */
export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");

/**
 * Helper: fetch tasks optionally filtered by status and searched by title
 * @param {{status?: 'todo'|'in_progress'|'completed'| 'all', search?: string}} params
 */
export async function fetchTasks(params = {}) {
  const { status = "all", search = "" } = params;
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (search?.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Create a new task
 * @param {{title: string, description?: string, status?: 'todo'|'in_progress'|'completed'}} payload
 */
export async function createTask(payload) {
  const insertPayload = {
    title: payload.title,
    description: payload.description ?? "",
    status: payload.status ?? "todo",
  };
  const { data, error } = await supabase.from("tasks").insert(insertPayload).select().single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing task
 * @param {string} id UUID of the task
 * @param {{title?: string, description?: string, status?: 'todo'|'in_progress'|'completed'}} updates
 */
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete a task by id
 * @param {string} id UUID of the task
 */
export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  return true;
}
