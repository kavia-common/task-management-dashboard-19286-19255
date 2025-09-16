import React from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * MetricsCards
 *
 * Displays key task metrics in a responsive grid of cards.
 * Ocean Professional theme with Tailwind utility classes.
 *
 * Props:
 * - metrics: {
 *     statusCounts: Record<string, number>,
 *     dueToday: number,
 *     overdue: number
 *   }
 * - className: optional additional classes for the wrapper
 */
export default function MetricsCards({ metrics, className = "" }) {
  const statusCounts = metrics?.statusCounts || {};
  const todo = statusCounts.todo || 0;
  const inprogress = statusCounts.inprogress || 0;
  const done = statusCounts.done || 0;

  const cards = [
    {
      key: "todo",
      label: "To Do",
      value: todo,
      accent: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },
    {
      key: "inprogress",
      label: "In Progress",
      value: inprogress,
      accent: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    {
      key: "done",
      label: "Done",
      value: done,
      accent: "bg-green-50 text-green-700",
      dot: "bg-green-500",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: metrics?.overdue ?? 0,
      accent: "bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {cards.map((c) => (
        <div key={c.key} className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${c.dot}`} />
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.accent}`}>
              {c.key === "overdue" ? "Alerts" : "Status"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-text">{c.value}</p>
          {c.key === "inprogress" && (
            <p className="mt-1 text-xs text-gray-500">Active tasks</p>
          )}
          {c.key === "overdue" && (
            <p className="mt-1 text-xs text-red-500">Needs attention</p>
          )}
        </div>
      ))}
    </div>
  );
}

MetricsCards.propTypes = {
  metrics: PropTypes.shape({
    statusCounts: PropTypes.object,
    dueToday: PropTypes.number,
    overdue: PropTypes.number,
  }),
  className: PropTypes.string,
};
