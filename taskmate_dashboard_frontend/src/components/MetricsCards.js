import React from "react";

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</div>
  </div>
);

// PUBLIC_INTERFACE
export default function MetricsCards({ counts }) {
  /**
   * Shows counts for tasks by status.
   * counts: { total: number, todo: number, in_progress: number, completed: number }
   */
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Total" value={counts.total ?? 0} accent="text-gray-900" />
      <StatCard label="To Do" value={counts.todo ?? 0} accent="text-primary" />
      <StatCard label="In Progress" value={counts.in_progress ?? 0} accent="text-secondary" />
      <StatCard label="Completed" value={counts.completed ?? 0} accent="text-green-600" />
    </div>
  );
}
