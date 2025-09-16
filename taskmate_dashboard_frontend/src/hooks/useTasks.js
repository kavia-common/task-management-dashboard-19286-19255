import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listTasks as apiListTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  getMetrics as apiGetMetrics,
} from "../services/tasksService";

/**
 * PUBLIC_INTERFACE
 * useTasks
 *
 * Encapsulates task state management, filtering/searching, CRUD operations, and metrics retrieval.
 * Designed for minimal external dependencies and later extension with real-time and a11y enhancements.
 *
 * State/returns:
 * - tasks: Task[] - current list following filters
 * - rawTasks: Task[] - raw, unfiltered list (for future real-time use)
 * - metrics: TaskMetrics - derived metrics from backend
 * - loading: boolean
 * - error: Error|null
 * - filters: { search, status, order: { column, ascending } }
 * - setFilters(next): void - updates filters and reloads tasks
 * - refresh(): Promise<void> - refetch both tasks and metrics
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
    return () => { mountedRef.current = false; };
  }, []);

  const fetchTasks = useCallback(async (currentFilters = filters) => {
    const data = await apiListTasks(currentFilters);
    return data;
  }, [filters]);

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
      setTasks(data); // as we fetch already filtered on backend
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
    return () => { cancelled = true; };
  }, [filters, fetchTasks, fetchMetrics]);

  // PUBLIC_INTERFACE
  const createTask = useCallback(async (payload) => {
    setError(null);
    const created = await apiCreateTask(payload);
    // Optimistic merge
    setRawTasks((prev) => [created, ...prev]);
    setTasks((prev) => [created, ...prev]);
    // Refresh metrics to reflect new state
    const m = await fetchMetrics();
    if (mountedRef.current) setMetrics(m);
    return created;
  }, [fetchMetrics]);

  // PUBLIC_INTERFACE
  const updateTask = useCallback(async (id, payload) => {
    setError(null);
    const updated = await apiUpdateTask(id, payload);
    setRawTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    // Metrics can change (e.g., status move)
    const m = await fetchMetrics();
    if (mountedRef.current) setMetrics(m);
    return updated;
  }, [fetchMetrics]);

  // PUBLIC_INTERFACE
  const deleteTask = useCallback(async (id) => {
    setError(null);
    await apiDeleteTask(id);
    setRawTasks((prev) => prev.filter((t) => t.id !== id));
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const m = await fetchMetrics();
    if (mountedRef.current) setMetrics(m);
    return true;
  }, [fetchMetrics]);

  // PUBLIC_INTERFACE
  const changeStatus = useCallback(async (task, newStatus) => {
    if (!task || !task.id) return null;
    return updateTask(task.id, { status: newStatus });
  }, [updateTask]);

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
    refresh,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
  };
}
