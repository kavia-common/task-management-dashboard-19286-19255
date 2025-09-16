import React, { useEffect, useState } from "react";
import "./index.css";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";

/**
 * PUBLIC_INTERFACE
 * App
 *
 * Primary application shell for TaskMate dashboard using the Ocean Professional theme.
 * - Uses Tailwind utility classes only for layout and styling.
 * - Provides a global theme toggle (light/dark) by switching a data-theme attribute on <html>.
 * - Establishes the main layout: Header + Container with placeholder sections for metrics and task list.
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
            <p className="text-sm text-gray-500">Theme: {theme}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-500">To Do</p>
              <p className="mt-1 text-2xl font-semibold text-text">—</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="mt-1 text-2xl font-semibold text-text">—</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Done</p>
              <p className="mt-1 text-2xl font-semibold text-text">—</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="mt-1 text-2xl font-semibold text-text">—</p>
            </div>
          </div>
        </section>

        {/* Task List Placeholder Section */}
        <section aria-labelledby="tasks-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="tasks-heading" className="text-lg font-semibold text-text">
              Tasks
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder="Search tasks..."
                className="w-56 rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search tasks"
              />
              <select
                aria-label="Filter by status"
                className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="">All</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button className="btn-primary rounded-lg px-3 py-2 text-sm">
                Add Task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="font-medium text-text mb-2">To Do</h3>
              <p className="text-sm text-gray-500">No tasks yet.</p>
            </div>
            <div className="card">
              <h3 className="font-medium text-text mb-2">In Progress</h3>
              <p className="text-sm text-gray-500">No tasks yet.</p>
            </div>
            <div className="card">
              <h3 className="font-medium text-text mb-2">Done</h3>
              <p className="text-sm text-gray-500">No tasks yet.</p>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}

export default App;
