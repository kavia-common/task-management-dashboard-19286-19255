import React, { useEffect, useState } from "react";
import "./index.css";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import MetricsCards from "./components/dashboard/MetricsCards";
import TaskFilters from "./components/tasks/TaskFilters";
import TaskBoard from "./components/tasks/TaskBoard";
import TaskForm from "./components/tasks/TaskForm";
import useTasks from "./hooks/useTasks";
import EmptyState from "./components/tasks/EmptyState";

/**
 * PUBLIC_INTERFACE
 * App
 *
 * Primary application shell for TaskMate dashboard using the Ocean Professional theme.
 * - Uses Tailwind utility classes only for layout and styling.
 * - Provides a global theme toggle (light/dark) by switching a data-theme attribute on <html>.
 * - Establishes the main layout: Header + Container with sections for metrics and task list.
 * - Integrates useTasks hook to bind UI with data and actions.
 */
function App() {
  const [theme, setTheme] = useState("light");

  // Apply theme to the document element to allow theme-based styling hooks if needed
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Hook: data and actions
  const {
    tasks,
    metrics,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
  } = useTasks({
    search: "",
    status: "",
    order: { column: "created_at", ascending: false },
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleAddClick = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmitForm = async (values) => {
    if (editing) {
      await updateTask(editing.id, values);
    } else {
      await createTask(values);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleEditTask = (task) => {
    setEditing(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
  };

  const handleStatusChange = async (task, newStatus) => {
    await changeStatus(task, newStatus);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleTheme={toggleTheme} theme={theme} />
      <Container>
        {/* Metrics Section */}
        <section aria-labelledby="metrics-heading" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 id="metrics-heading" className="text-lg font-semibold text-text">
              Dashboard
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                className="rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Refresh data"
              >
                Refresh
              </button>
              <p className="text-sm text-gray-500">Theme: {theme}</p>
            </div>
          </div>

          <MetricsCards metrics={metrics} />
        </section>

        {/* Task Controls */}
        <section aria-labelledby="tasks-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="tasks-heading" className="text-lg font-semibold text-text">
              Tasks
            </h2>
          </div>

          <TaskFilters
            value={filters}
            onChange={setFilters}
            onAddClick={handleAddClick}
          />

          {/* Form Drawer/Card */}
          {showForm && (
            <div className="card">
              <h3 className="text-base font-semibold text-text mb-3">
                {editing ? "Edit Task" : "Add Task"}
              </h3>
              <TaskForm
                initial={editing}
                onCancel={handleCancelForm}
                onSubmit={handleSubmitForm}
                submitLabel={editing ? "Update Task" : "Create Task"}
              />
            </div>
          )}

          {/* Loading/Error states */}
          {loading && (
            <div className="card">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          )}

          {error && (
            <div className="card">
              <p className="text-sm text-red-600">
                {error.message || "An error occurred while fetching data."}
              </p>
            </div>
          )}

          {/* Task Board */}
          {!loading && !error && (
            <TaskBoard
              tasks={tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              empty={
                <EmptyState
                  icon="🗂️"
                  title="No tasks yet"
                  description="Get started by creating your first task. You can organize them by status and track due dates."
                  action={
                    <button
                      className="btn-primary rounded-lg px-3 py-2 text-sm"
                      onClick={handleAddClick}
                    >
                      Add Task
                    </button>
                  }
                />
              }
            />
          )}
        </section>
      </Container>
    </div>
  );
}

export default App;
