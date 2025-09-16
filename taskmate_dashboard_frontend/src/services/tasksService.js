import { supabase } from '../lib/supabaseClient';

/**
 * @typedef {Object} Task
 * @property {string|number} id - Unique task identifier (uuid or serial as per DB).
 * @property {string} title - Task title.
 * @property {string} [description] - Optional task description.
 * @property {('todo'|'inprogress'|'done'|string)} status - Task status.
 * @property {string|null} [due_date] - ISO date string (YYYY-MM-DD) or null.
 * @property {string} created_at - ISO datetime string of creation.
 * @property {string} updated_at - ISO datetime string of last update.
 */

/**
 * @typedef {Object} ListTasksParams
 * @property {('todo'|'inprogress'|'done'|string)=} status - Optional status filter.
 * @property {string=} search - Optional case-insensitive search on title.
 * @property {{ column?: 'created_at'|'updated_at'|'due_date'|'title'|'status', ascending?: boolean }=} order - Optional ordering options.
 */

/**
 * @typedef {Object} TaskCreateInput
 * @property {string} title - Task title.
 * @property {string=} description - Optional description.
 * @property {('todo'|'inprogress'|'done'|string)=} status - Status (default 'todo' if not specified in DB).
 * @property {string|null=} due_date - ISO date string (YYYY-MM-DD) or null.
 */

/**
 * @typedef {Partial<TaskCreateInput>} TaskUpdateInput
 */

/**
 * @typedef {Object} TaskMetrics
 * @property {Record<string, number>} statusCounts - Map of status to counts, e.g., { todo: 5, inprogress: 3, done: 7 }
 * @property {number} dueToday - Count of tasks with due_date equal to today.
 * @property {number} overdue - Count of tasks with due_date before today and not done.
 */

// Helpers

/**
 * Build a Supabase query for the tasks table with common filters.
 * @param {ListTasksParams} [params]
 */
function buildListQuery(params = {}) {
  const { status, search, order } = params;
  let query = supabase.from('tasks').select('*');

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    // ilike is case-insensitive; wrap with % for contains
    query = query.ilike('title', `%${search}%`);
  }

  const sortColumn = order?.column || 'created_at';
  const sortAscending = order?.ascending ?? false;
  query = query.order(sortColumn, { ascending: sortAscending });

  return query;
}

/**
 * Format an error into a thrown Error with context.
 * @param {import('@supabase/supabase-js').PostgrestError} error
 * @param {string} context
 */
function throwIfError(error, context) {
  if (error) {
    const e = new Error(`${context}: ${error.message}`);
    e.cause = error;
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function listTasks(params = {}) {
  /**
   * List tasks with optional filters and ordering.
   * @param {ListTasksParams} [params]
   * @returns {Promise<Task[]>}
   */
  const { data, error } = await buildListQuery(params);
  throwIfError(error, 'Failed to list tasks');
  return data || [];
}

// PUBLIC_INTERFACE
export async function getTask(id) {
  /**
   * Retrieve a single task by id.
   * @param {string|number} id
   * @returns {Promise<Task|null>}
   */
  if (!id && id !== 0) {
    throw new Error('getTask: "id" is required');
  }
  const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
  throwIfError(error, `Failed to get task with id=${id}`);
  return data ?? null;
}

// PUBLIC_INTERFACE
export async function createTask(payload) {
  /**
   * Create a new task.
   * @param {TaskCreateInput} payload
   * @returns {Promise<Task>}
   */
  if (!payload || !payload.title) {
    throw new Error('createTask: "title" is required');
  }

  const insertPayload = {
    title: payload.title,
    description: payload.description ?? null,
    status: payload.status ?? 'todo',
    due_date: payload.due_date ?? null,
  };

  const { data, error } = await supabase.from('tasks').insert(insertPayload).select('*').single();
  throwIfError(error, 'Failed to create task');
  return data;
}

// PUBLIC_INTERFACE
export async function updateTask(id, payload) {
  /**
   * Update a task by id.
   * @param {string|number} id
   * @param {TaskUpdateInput} payload
   * @returns {Promise<Task>}
   */
  if (!id && id !== 0) {
    throw new Error('updateTask: "id" is required');
  }
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('updateTask: "payload" must contain at least one field');
  }

  // Only allow known fields
  const updatable = {};
  if (typeof payload.title !== 'undefined') updatable.title = payload.title;
  if (typeof payload.description !== 'undefined') updatable.description = payload.description;
  if (typeof payload.status !== 'undefined') updatable.status = payload.status;
  if (typeof payload.due_date !== 'undefined') updatable.due_date = payload.due_date;

  const { data, error } = await supabase.from('tasks').update(updatable).eq('id', id).select('*').single();
  throwIfError(error, `Failed to update task with id=${id}`);
  return data;
}

// PUBLIC_INTERFACE
export async function deleteTask(id) {
  /**
   * Delete a task by id.
   * @param {string|number} id
   * @returns {Promise<boolean>} True if delete was successful.
   */
  if (!id && id !== 0) {
    throw new Error('deleteTask: "id" is required');
  }

  // Return deleted row(s) if needed; here we only return success boolean
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  throwIfError(error, `Failed to delete task with id=${id}`);
  return true;
}

// PUBLIC_INTERFACE
export async function getMetrics() {
  /**
   * Fetch dashboard metrics:
   * - statusCounts: count per status
   * - dueToday: tasks due today
   * - overdue: tasks with due_date before today and not done
   * @returns {Promise<TaskMetrics>}
   */
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Status counts: group by status using RPC if available; otherwise fetch and reduce.
  // Since generic SQL RPC might not exist, do a lightweight select of only status.
  const [statusRes, dueTodayRes, overdueRes] = await Promise.all([
    supabase.from('tasks').select('status'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('due_date', todayStr),
    // Overdue: due_date < today and status != 'done'
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .lt('due_date', todayStr)
      .neq('status', 'done'),
  ]);

  // Handle errors separately for clarity
  throwIfError(statusRes.error, 'Failed to fetch status list for metrics');
  throwIfError(dueTodayRes.error, 'Failed to fetch due today count');
  throwIfError(overdueRes.error, 'Failed to fetch overdue count');

  /** @type {Record<string, number>} */
  const statusCounts = {};
  (statusRes.data || []).forEach((row) => {
    const key = row.status ?? 'unknown';
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  return {
    statusCounts,
    dueToday: typeof dueTodayRes.count === 'number' ? dueTodayRes.count : 0,
    overdue: typeof overdueRes.count === 'number' ? overdueRes.count : 0,
  };
}

/**
 * PUBLIC_INTERFACE
 * subscribeToTasks
 *
 * Create a real-time channel subscription for Postgres changes on "public.tasks".
 * Consumers pass an onEvent callback to receive { type: 'INSERT'|'UPDATE'|'DELETE', new|old } payloads.
 * Returns an unsubscribe function to remove the channel.
 */
export function subscribeToTasks(onEvent) {
  /** @type {import('@supabase/supabase-js').RealtimeChannel | null} */
  const channel = supabase
    .channel('realtime:tasks')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        try {
          if (typeof onEvent === 'function') {
            // Normalize event shape
            const evt = {
              type: payload.eventType,
              new: payload.new,
              old: payload.old,
            };
            onEvent(evt);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[Supabase] Error in tasks onEvent handler:', err);
        }
      }
    )
    .subscribe((status) => {
      // optional status listener
      if (status === 'SUBSCRIBED') {
        // eslint-disable-next-line no-console
        console.info('[Supabase] Subscribed to tasks realtime channel');
      }
    });

  return () => {
    try {
      if (channel) {
        supabase.removeChannel(channel);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Supabase] Failed to remove tasks channel', e);
    }
  };
}

/**
 * PUBLIC_INTERFACE
 * isRealtimeAvailable
 *
 * Returns a boolean indicating if Supabase URL/Key seem configured.
 * This is a heuristic to decide whether to rely on realtime or use refresh fallback.
 */
export function isRealtimeAvailable() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_KEY;
  return Boolean(url && key);
}

export default {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getMetrics,
  subscribeToTasks,
  isRealtimeAvailable,
};
