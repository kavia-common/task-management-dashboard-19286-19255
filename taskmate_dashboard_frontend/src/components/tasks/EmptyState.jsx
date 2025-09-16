import React from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * EmptyState
 *
 * Generic empty state component with icon, title, description, and action.
 *
 * Props:
 * - icon: React node
 * - title: string
 * - description: string
 * - action: React node (button or link)
 */
export default function EmptyState({ icon = "🗂️", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <div className="text-4xl mb-2" aria-hidden>{icon}</div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};
