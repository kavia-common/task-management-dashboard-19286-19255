import React from "react";
import PropTypes from "prop-types";
import TaskCard from "./TaskCard";

/**
 * PUBLIC_INTERFACE
 * TaskColumn
 *
 * Renders a single column in the TaskBoard with a title, count, and its task cards.
 *
 * Props:
 * - title: string - Column title
 * - tasks: array - Tasks assigned to this column
 * - statusKey: 'todo'|'inprogress'|'done' - Status this column represents
 * - accentClass: string - Tailwind classes to accent the column header
 * - onEdit: function(task)
 * - onDelete: function(id)
 * - onStatusChange: function(task, newStatus)
 */
export default function TaskColumn({
  title,
  tasks = [],
  statusKey,
  accentClass = "",
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const count = tasks.length;

  return (
    <div className="card" role="region" aria-label={`${title} column`}>
      <div className={`flex items-center justify-between border-b pb-2 ${accentClass}`}>
        <h3 className="font-medium text-text">{title}</h3>
        <span className="text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-700" aria-label={`${count} tasks`}>
          {count}
        </span>
      </div>
      <div className="mt-3 space-y-3">
        {count === 0 ? (
          <p className="text-sm text-gray-500">No tasks yet.</p>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onEdit={() => onEdit && onEdit(t)}
              onDelete={() => onDelete && onDelete(t.id)}
              onStatusChange={(newStatus) =>
                onStatusChange && onStatusChange(t, newStatus)
              }
              currentStatus={statusKey}
            />
          ))
        )}
      </div>
    </div>
  );
}

TaskColumn.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.object),
  statusKey: PropTypes.oneOf(["todo", "inprogress", "done"]).isRequired,
  accentClass: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
};
