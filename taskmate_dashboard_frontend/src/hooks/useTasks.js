import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listTasks as apiListTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  getMetrics as apiGetMetrics,
  // realtime helpers
  subscribeToTasks,
  isRealtimeAvailable,
} from "../services/tasksService";

/**
 * PUBLIC_INTERFACE
 * useTasks
 *
 * Encapsulates task state management, filtering/searching, CRUD operations, metrics retrieval,
 * and Supabase real-time updates subscription.
 *
 * State/returns:
 * - tasks: Task[] - current list following filters
 * - rawTasks: Task[] - raw, unfiltered list kept locally for merging
 * - metrics: TaskMetrics - derived metrics from backend
 * - loading: boolean
 * - error: Error|null
 * - filters: { search, status, order: { column, ascending } }
 * - setFilters(next): void - updates filters and reloads tasks
 * - refresh(): Promise<void> - refetch both tasks and metrics (used as fallback if realtime is unavailable)
 * - createTask(values): Promise<Task>
 * - updateTask(id, values): Promise<Task>
 * - deleteTask(id): Promise<boolean>
 * - changeStatus(task, newStatus): Promise<Task> - convenience wrapper
 */
export default function useTasks(initialFilters = {}) {
  const [tasks, setTasks] = useState([]);
  const [rawTasks, setRawTasks] = useState([]);
  const [metrics, setMetrics] = useState({ statusCounts: {}, dueToday: 0, overdue: 0 });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    order: { column: "created_at", ascending: false },
    ...initialFilters,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track mounted state to avoid setting state after unmount in async flows
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchTasks = useCallback(
    async (currentFilters = filters) => {
      const data = await apiListTasks(currentFilters);
      return data;
    },
    [filters]
  );

  const fetchMetrics = useCallback(async () => {
    const m = await apiGetMetrics();
    return m;
  }, []);

  // PUBLIC_INTERFACE
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, m] = await Promise.all([fetchTasks(), fetchMetrics()]);
      if (!mountedRef.current) return;
      setRawTasks(data);
      setTasks(data); // backend already applied filters/order
      setMetrics(m);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [fetchTasks, fetchMetrics]);

  // Fetch on mount and whenever filters change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, m] = await Promise.all([fetchTasks(filters), fetchMetrics()]);
        if (cancelled || !mountedRef.current) return;
        setRawTasks(data);
        setTasks(data);
        setMetrics(m);
      } catch (e) {
        if (cancelled || !mountedRef.current) return;
        setError(e);
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filters, fetchTasks, fetchMetrics]);

  // PUBLIC_INTERFACE
  const createTask = useCallback(
    async (payload) => {
      setError(null);
      const created = await apiCreateTask(payload);
      // Optimistic merge
      setRawTasks((prev) => [created, ...prev]);
      setTasks((prev) => [created, ...prev]);
      // Refresh metrics to reflect new state
      const m = await fetchMetrics();
      if (mountedRef.current) setMetrics(m);
      return created;
    },
    [fetchMetrics]
  );

  // PUBLIC_INTERFACE
  const updateTask = useCallback(
    async (id, payload) => {
      setError(null);
      const updated = await apiUpdateTask(id, payload);
      setRawTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      // Metrics can change (e.g., status move)
      const m = await fetchMetrics();
      if (mountedRef.current) setMetrics(m);
      return updated;
    },
    [fetchMetrics]
  );

  // PUBLIC_INTERFACE
  const deleteTask = useCallback(
    async (id) => {
      setError(null);
      await apiDeleteTask(id);
      setRawTasks((prev) => prev.filter((t) => t.id !== id));
      setTasks((prev) => prev.filter((t) => t.id !== id));
      const m = await fetchMetrics();
      if (mountedRef.current) setMetrics(m);
      return true;
    },
    [fetchMetrics]
  );

  // PUBLIC_INTERFACE
  const changeStatus = useCallback(
    async (task, newStatus) => {
      if (!task || !task.id) return null;
      return updateTask(task.id, { status: newStatus });
    },
    [updateTask]
  );

  // Setup Supabase realtime subscription; cleanup on unmount.
  useEffect(() => {
    // If realtime is not available (env not set), skip subscription.
    if (!isRealtimeAvailable) return; // function exists; still create fallback to refresh
    if (!isRealtimeAvailable()) return;

    // Merge helper that respects current filters
    const applyFilters = (items, currentFilters) => {
      let res = [...items];
      if (currentFilters.status) {
        res = res.filter((t) => (t.status || "") === currentFilters.status);
      }
      if (currentFilters.search) {
        const q = currentFilters.search.toLowerCase();
        res = res.filter((t) => (t.title || "").toLowerCase().includes(q));
      }
      const col = currentFilters.order?.column || "created_at";
      const asc = currentFilters.order?.ascending ?? false;
      res.sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (av === bv) return 0;
        if (av == null) return asc ? -1 : 1;
        if (bv == null) return asc ? 1 : -1;
        if (av < bv) return asc ? -1 : 1;
        return asc ? 1 : -1;
      });
      return res;
    };

    const unsubscribe = subscribeToTasks((evt) => {
      if (!mountedRef.current) return;

      // Update rawTasks first
      setRawTasks((prev) => {
        let next = prev;
        if (evt.type === "INSERT" && evt.new) {
          const exists = prev.some((t) => t.id === evt.new.id);
          next = exists ? prev.map((t) => (t.id === evt.new.id ? evt.new : t)) : [evt.new, ...prev];
        } else if (evt.type === "UPDATE" && evt.new) {
          next = prev.map((t) => (t.id === evt.new.id ? evt.new : t));
        } else if (evt.type === "DELETE" && evt.old) {
          next = prev.filter((t) => t.id !== evt.old.id);
        } else {
          next = prev;
        }
        // Also compute filtered/sorted tasks view
        setTasks((cur) => {
          // derive from updated next not from cur to avoid drift
          return applyFilters(next, filters);
        });
        return next;
      });

      // Update metrics with a cheap fallback: refetch metrics after each event
      // This keeps logic simple and consistent with backend
      fetchMetrics().then((m) => {
        if (mountedRef.current) setMetrics(m);
      });
    });

    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[Realtime] Failed to unsubscribe tasks channel", e);
      }
    };
    // include filters so applyFilters uses latest settings
  }, [filters, fetchMetrics]);

  // Expose derived info if needed later
  const counts = useMemo(() => {
    const acc = { todo: 0, inprogress: 0, done: 0 };
    for (const t of tasks) {
      const k = t.status || "todo";
      acc[k] = (acc[k] || 0) + 1;
    }
    return acc;
  }, [tasks]);

  return {
    tasks,
    rawTasks,
    metrics,
    counts,
    loading,
    error,
    filters,
    setFilters,
    refresh, // Fallback for manual refetch if realtime is disabled/unavailable
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
  };
}
