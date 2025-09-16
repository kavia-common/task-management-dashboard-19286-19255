import React from "react";
import PropTypes from "prop-types";
import TaskColumn from "./TaskColumn";

/**
 * PUBLIC_INTERFACE
 * TaskBoard
 *
 * Kanban-style board that groups tasks into columns by status.
 * Responsive: stacks on mobile, three columns on larger screens.
 *
 * Props:
 * - tasks: array of task objects
 * - onEdit: function(task) => void
 * - onDelete: function(id) => void
 * - onStatusChange: function(task, newStatus) => void
 * - empty: React node to render when all columns are empty (optional)
 */
export default function TaskBoard({
  tasks = [],
  onEdit,
  onDelete,
  onStatusChange,
  empty = null,
}) {
  const columns = [
    { key: "todo", title: "To Do", accent: "border-blue-100" },
    { key: "inprogress", title: "In Progress", accent: "border-amber-100" },
    { key: "done", title: "Done", accent: "border-green-100" },
  ];

  const grouped = tasks.reduce(
    (acc, t) => {
      const k = t.status || "todo";
      if (!acc[k]) acc[k] = [];
      acc[k].push(t);
      return acc;
    },
    { todo: [], inprogress: [], done: [] }
  );

  const allEmpty =
    grouped.todo.length === 0 &&
    grouped.inprogress.length === 0 &&
    grouped.done.length === 0;

  if (allEmpty && empty) {
    return <div className="card">{empty}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {columns.map((col) => (
        <TaskColumn
          key={col.key}
          title={col.title}
          tasks={grouped[col.key] || []}
          statusKey={col.key}
          accentClass={col.accent}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

TaskBoard.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  empty: PropTypes.node,
};
