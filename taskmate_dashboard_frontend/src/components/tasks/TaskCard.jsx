import React from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * TaskCard
 *
 * Displays a task with title, optional description and due date, and controls:
 * - Status select
 * - Edit and Delete actions
 *
 * Props:
 * - task: Task object
 * - currentStatus: current column key
 * - onEdit: function()
 * - onDelete: function()
 * - onStatusChange: function(newStatus)
 */
export default function TaskCard({
  task,
  currentStatus,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const due = task?.due_date ? new Date(task.due_date) : null;
  const today = new Date();
  const isOverdue =
    due && due.setHours(0, 0, 0, 0) < new Date(today.setHours(0, 0, 0, 0)) && task.status !== "done";

  return (
    <div className="rounded-lg border border-gray-200 bg-surface p-3 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-text">{task.title}</h4>
          {task.description ? (
            <p className="mt-1 text-xs text-gray-600 line-clamp-3">
              {task.description}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <select
              aria-label="Change status"
              className="rounded-md border border-gray-200 bg-surface px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
              value={task.status || currentStatus}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
            {task.due_date && (
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  isOverdue
                    ? "bg-error-50 text-error"
                    : "bg-gray-100 text-gray-700"
                }`}
                title={`Due ${task.due_date}`}
              >
                Due {task.due_date}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="text-xs px-2 py-1 rounded-md bg-primary-50 text-primary hover:bg-blue-100"
            onClick={onEdit}
            aria-label={`Edit task ${task.title}`}
            title="Edit task"
          >
            Edit
          </button>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded-md bg-error-50 text-error hover:bg-red-100"
            onClick={onDelete}
            aria-label={`Delete task ${task.title}`}
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string,
    due_date: PropTypes.string,
  }).isRequired,
  currentStatus: PropTypes.oneOf(["todo", "inprogress", "done"]),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
};
