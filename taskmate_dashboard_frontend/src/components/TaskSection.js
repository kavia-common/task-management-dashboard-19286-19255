import React from "react";
import TaskCard from "./TaskCard";

const titles = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

// PUBLIC_INTERFACE
export default function TaskSection({ status, tasks, onEdit, onDelete }) {
  /**
   * Renders a section with tasks for a given status.
   */
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{titles[status]}</h3>
        <span className="text-xs text-gray-500">{tasks.length} items</span>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
            No tasks in this section.
          </div>
        ) : (
          tasks.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
