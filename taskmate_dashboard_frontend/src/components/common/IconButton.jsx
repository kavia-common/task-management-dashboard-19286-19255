import React from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * IconButton
 *
 * A reusable icon-styled action button that aligns with the Ocean Professional theme.
 * Uses TailwindCSS utility classes and supports variants, sizes, disabled state, and accessible labels.
 *
 * Props:
 * - icon: React node (required) - the icon content, can be an emoji or SVG
 * - label: string (required) - accessible label for screen readers (will be visually hidden)
 * - onClick: function - click handler
 * - variant: "primary" | "secondary" | "ghost" | "danger" (default: "primary")
 * - size: "sm" | "md" | "lg" (default: "md")
 * - className: additional class names
 * - type: button type (default: "button")
 */
export default function IconButton({
  icon,
  label,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  const variants = {
    primary:
      "bg-primary text-white hover:bg-blue-600 shadow-soft",
    secondary:
      "bg-secondary text-white hover:bg-amber-600 shadow-soft",
    ghost:
      "bg-transparent text-text hover:bg-primary-50",
    danger:
      "bg-error text-white hover:bg-red-600 shadow-soft",
  };

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "secondary", "ghost", "danger"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
};
