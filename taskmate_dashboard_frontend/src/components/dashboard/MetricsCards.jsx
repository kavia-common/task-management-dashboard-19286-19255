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
      accent: "bg-primary-50 text-primary",
      dot: "bg-primary",
    },
    {
      key: "inprogress",
      label: "In Progress",
      value: inprogress,
      accent: "bg-secondary-50 text-secondary",
      dot: "bg-secondary",
    },
    {
      key: "done",
      label: "Done",
      value: done,
      accent: "bg-success-50 text-success",
      dot: "bg-success",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: metrics?.overdue ?? 0,
      accent: "bg-error-50 text-error",
      dot: "bg-error",
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
