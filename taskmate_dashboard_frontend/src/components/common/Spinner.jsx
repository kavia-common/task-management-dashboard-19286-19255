import React from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * Spinner
 *
 * Accessible spinner component used to indicate loading states.
 * Provides ARIA attributes and optional screen-reader text.
 *
 * Props:
 * - size: "sm" | "md" | "lg" (visual size of spinner)
 * - label: string (screen-reader text; defaults to "Loading")
 * - inline: boolean (if true, spinner is sized for inline placement)
 * - className: additional CSS classes
 */
export default function Spinner({ size = "md", label = "Loading", inline = false, className = "" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  const spinner = (
    <span
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`inline-flex items-center ${inline ? "" : "justify-center"} ${className}`}
    >
      <span
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );

  if (inline) return spinner;

  return (
    <div className="flex items-center justify-center py-4">
      {spinner}
      <span className="ml-2 text-sm text-gray-600" aria-hidden="true">
        {label}…
      </span>
    </div>
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  label: PropTypes.string,
  inline: PropTypes.bool,
  className: PropTypes.string,
};
