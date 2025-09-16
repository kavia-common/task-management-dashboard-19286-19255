import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import MetricsCards from "./components/MetricsCards";
import ControlsBar from "./components/ControlsBar";
import TaskFormModal from "./components/TaskFormModal";
import TaskSection from "./components/TaskSection";
import { createTask, deleteTask, fetchTasks, updateTask } from "./supabaseClient";

// PUBLIC_INTERFACE
function App() {
  /**
   * Main TaskMate Dashboard application component.
   *
   * Features:
   * - Connects to Supabase using env vars (REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_KEY)
   * - Dashboard metrics (counts by status)
   * - Grouped task list (To Do, In Progress, Completed)
   * - CRUD operations (Add/Edit/Delete) with instant UI updates
   * - Search by title and filter by status
   * - Responsive modern UI using TailwindCSS
   */
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = useCallback(async (opts = {}) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await fetchTasks({
        status: opts.status ?? statusFilter,
        search: opts.search ?? search,
      });
      setTasks(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setErrorMsg(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    // initial fetch
    refresh();
  }, [refresh]);

  useEffect(() => {
    // re-fetch when filters change (covered via refresh deps)
    refresh({ status: statusFilter, search });
  }, [statusFilter, search, refresh]);

  const counts = useMemo(() => {
    const c = { total: tasks.length, todo: 0, in_progress: 0, completed: 0 };
    for (const t of tasks) {
      if (t.status === "todo") c.todo += 1;
      else if (t.status === "in_progress") c.in_progress += 1;
      else if (t.status === "completed") c.completed += 1;
    }
    return c;
  }, [tasks]);

  const grouped = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      completed: tasks.filter((t) => t.status === "completed"),
    };
  }, [tasks]);

  const handleAddClick = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleDelete = async (task) => {
    const confirmDelete = window.confirm(`Delete "${task.title}"?`);
    if (!confirmDelete) return;
    // Optimistic update
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== task.id));
    try {
      await deleteTask(task.id);
    } catch (err) {
      // rollback
      setTasks(prev);
      // eslint-disable-next-line no-alert
      alert(err?.message || "Failed to delete task");
    }
  };

  const handleSubmitForm = async (form) => {
    if (editing) {
      // Optimistic update for edit
      const prev = tasks;
      const updatedLocal = prev.map((t) =>
        t.id === editing.id ? { ...t, ...form } : t
      );
      setTasks(updatedLocal);
      try {
        const updated = await updateTask(editing.id, form);
        setTasks((ts) => ts.map((t) => (t.id === editing.id ? updated : t)));
      } catch (err) {
        setTasks(prev);
        // eslint-disable-next-line no-alert
        alert(err?.message || "Failed to update task");
      }
    } else {
      // create
      try {
        const created = await createTask({ ...form });
        setTasks((ts) => [created, ...ts]);
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert(err?.message || "Failed to create task");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Controls */}
        <ControlsBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAddNew={handleAddClick}
        />

        {/* Error banner */}
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Metrics */}
        <MetricsCards counts={counts} />

        {/* Content */}
        <section className="mt-2">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
              Loading tasks...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <TaskSection
                status="todo"
                tasks={grouped.todo}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <TaskSection
                status="in_progress"
                tasks={grouped.in_progress}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <TaskSection
                status="completed"
                tasks={grouped.completed}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </section>
      </main>

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editing}
      />

      <footer className="mt-8 border-t border-gray-200 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-gray-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} TaskMate
        </div>
      </footer>
    </div>
  );
}

export default App;
