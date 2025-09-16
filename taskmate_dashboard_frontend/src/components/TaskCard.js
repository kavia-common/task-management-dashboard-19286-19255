import React from "react";

function statusBadge(status) {
  const map = {
    todo: "bg-blue-50 text-primary ring-1 ring-primary/20",
    in_progress: "bg-amber-50 text-secondary ring-1 ring-secondary/20",
    completed: "bg-green-50 text-green-600 ring-1 ring-green-600/20",
  };
  return map[status] || "bg-gray-100 text-gray-700 ring-1 ring-gray-300";
}

// PUBLIC_INTERFACE
export default function TaskCard({ task, onEdit, onDelete }) {
  /**
   * Displays a task with title, description and status.
   * Provides edit and delete buttons.
   */
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-gray-900">{task.title}</h4>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusBadge(task.status)}`}>
              {task.status === "todo" && "To Do"}
              {task.status === "in_progress" && "In Progress"}
              {task.status === "completed" && "Completed"}
            </span>
          </div>
          {task.description ? (
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          ) : (
            <p className="mt-1 text-sm italic text-gray-400">No description</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
