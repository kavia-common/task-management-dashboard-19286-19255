import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import MetricsCards from "./components/dashboard/MetricsCards";
import TaskFilters from "./components/tasks/TaskFilters";
import TaskBoard from "./components/tasks/TaskBoard";
import TaskForm from "./components/tasks/TaskForm";
import useTasks from "./hooks/useTasks";
import EmptyState from "./components/tasks/EmptyState";
import Spinner from "./components/common/Spinner";

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
  const [uiError, setUiError] = useState(null);

  // Refs for focus management and live announcements
  const addButtonRef = useRef(null);
  const formTitleRef = useRef(null);
  const statusRegionRef = useRef(null);
  const errorRegionRef = useRef(null);

  const announce = (nodeRef, message) => {
    if (!nodeRef?.current) return;
    nodeRef.current.textContent = message || "";
  };

  const handleAddClick = () => {
    setEditing(null);
    setShowForm(true);
    // focus will move after render via useEffect below
  };

  const handleCancelForm = () => {
    setEditing(null);
    setShowForm(false);
    // Return focus to Add button for accessibility
    setTimeout(() => {
      addButtonRef.current && addButtonRef.current.focus();
    }, 0);
    announce(statusRegionRef, "Cancelled task form");
  };

  const handleSubmitForm = async (values) => {
    try {
      setUiError(null);
      if (editing) {
        await updateTask(editing.id, values);
        announce(statusRegionRef, "Task updated");
      } else {
        await createTask(values);
        announce(statusRegionRef, "Task created");
      }
      setShowForm(false);
      setEditing(null);
      setTimeout(() => {
        addButtonRef.current && addButtonRef.current.focus();
      }, 0);
    } catch (e) {
      const msg = e?.message || "There was an error saving the task";
      // Announce and show UI banner
      setUiError(msg);
      announce(errorRegionRef, msg);
      // Keep form open so user can correct/retry
    }
  };

  const handleEditTask = (task) => {
    setEditing(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      announce(statusRegionRef, "Task deleted");
    } catch (e) {
      announce(errorRegionRef, e?.message || "There was an error deleting the task");
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await changeStatus(task, newStatus);
      announce(statusRegionRef, `Status changed to ${newStatus}`);
    } catch (e) {
      announce(errorRegionRef, e?.message || "There was an error changing status");
    }
  };

  // When the form is shown, focus the first meaningful element
  useEffect(() => {
    if (showForm && formTitleRef.current) {
      // Delay to next tick so elements are painted
      setTimeout(() => {
        try {
          // focus form title or first input (managed inside TaskForm as well)
          formTitleRef.current.focus();
        } catch {
          // ignore
        }
      }, 0);
    }
  }, [showForm]);

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleTheme={toggleTheme} theme={theme} />
      <Container>
        {/* Live regions for announcements (screen-reader only) */}
        <p
          ref={statusRegionRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        <p
          ref={errorRegionRef}
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Inline error banner for operations */}
        {uiError && (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-error-50 p-3"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-red-700">{uiError}</p>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                onClick={() => setUiError(null)}
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
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
                title="Refresh dashboard data"
                aria-label="Refresh dashboard data"
              >
                Refresh
              </button>
              <p className="text-sm text-gray-500" aria-live="polite">Theme: {theme}</p>
            </div>
          </div>

          {loading ? (
            <div className="card" aria-busy="true" aria-describedby="metrics-loading">
              <Spinner label="Loading dashboard metrics" />
              <span id="metrics-loading" className="sr-only">Loading dashboard metrics</span>
            </div>
          ) : (
            <MetricsCards metrics={metrics} />
          )}
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
            <div
              className="card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-form-title"
            >
              <h3
                id="task-form-title"
                ref={formTitleRef}
                tabIndex={-1}
                className="text-base font-semibold text-text mb-3 focus:outline-none"
              >
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

          {/* Loading/Error states for Tasks */}
          {loading && (
            <div className="card" aria-busy="true" aria-describedby="tasks-loading">
              <Spinner label="Loading tasks" />
              <span id="tasks-loading" className="sr-only">Loading tasks</span>
            </div>
          )}

          {error && (
            <div
              className="card border border-red-200 bg-error-50"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-sm text-red-700 font-medium">
                We couldn’t load your tasks. Please check your connection or try again.
              </p>
              <p className="mt-1 text-xs text-red-600">
                {error.message || "An unexpected error occurred while fetching data."}
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={refresh}
                  className="btn-primary rounded-lg px-3 py-2 text-sm"
                  aria-label="Retry loading tasks"
                >
                  Try again
                </button>
              </div>
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
                  title="No results"
                  description="No tasks match your filters. Try adjusting search or status filters, or create a new task to get started."
                  live
                  action={
                    <button
                      ref={addButtonRef}
                      className="btn-primary rounded-lg px-3 py-2 text-sm"
                      onClick={handleAddClick}
                      aria-label="Add a new task"
                      title="Add a new task"
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
