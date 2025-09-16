import React from "react";
import classNames from "classnames";

// PUBLIC_INTERFACE
export default function ControlsBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onAddNew,
}) {
  /**
   * ControlsBar renders search and filter controls with an add button.
   */
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        >
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onAddNew}
          className={classNames(
            "inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-white shadow-sm",
            "hover:brightness-95 active:brightness-90 transition focus:outline-none focus:ring-2 focus:ring-primary/30"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
}
