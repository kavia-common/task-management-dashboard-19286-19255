import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * TaskFilters
 *
 * Filter/search controls for tasks:
 * - search query
 * - status filter
 * - order (column + ascending)
 *
 * Props:
 * - value: { search, status, order: { column, ascending } }
 * - onChange: function(nextValue)
 * - onAddClick: function() - called when Add Task button is clicked
 */
export default function TaskFilters({ value, onChange, onAddClick }) {
  const [local, setLocal] = useState({
    search: "",
    status: "",
    order: { column: "created_at", ascending: false },
  });

  useEffect(() => {
    if (value) setLocal({ ...local, ...value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setField = (field, v) => {
    const next = { ...local, [field]: v };
    setLocal(next);
    onChange && onChange(next);
  };

  const setOrder = (field, v) => {
    const next = { ...local, order: { ...local.order, [field]: v } };
    setLocal(next);
    onChange && onChange(next);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <input
          type="search"
          placeholder="Search tasks..."
          className="w-full sm:w-64 rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search tasks"
          value={local.search}
          onChange={(e) => setField("search", e.target.value)}
        />
        <select
          aria-label="Filter by status"
          className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={local.status}
          onChange={(e) => setField("status", e.target.value)}
        >
          <option value="">All</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          aria-label="Order by"
          className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={local.order?.column || "created_at"}
          onChange={(e) => setOrder("column", e.target.value)}
        >
          <option value="created_at">Created</option>
          <option value="updated_at">Updated</option>
          <option value="due_date">Due Date</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
        <button
          type="button"
          onClick={() => setOrder("ascending", !local.order?.ascending)}
          className="rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
          title="Toggle sort direction"
        >
          {local.order?.ascending ? "Asc" : "Desc"}
        </button>
      </div>
      <div className="flex items-center justify-end">
        <button
          className="btn-primary rounded-lg px-3 py-2 text-sm"
          onClick={onAddClick}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}

TaskFilters.propTypes = {
  value: PropTypes.shape({
    search: PropTypes.string,
    status: PropTypes.string,
    order: PropTypes.shape({
      column: PropTypes.string,
      ascending: PropTypes.bool,
    }),
  }),
  onChange: PropTypes.func,
  onAddClick: PropTypes.func,
};
