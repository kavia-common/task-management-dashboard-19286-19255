import React from "react";
import PropTypes from "prop-types";
import IconButton from "../common/IconButton";

/**
 * PUBLIC_INTERFACE
 * Header
 *
 * Application header showing:
 * - App name (TaskMate)
 * - Ocean Professional color palette chips
 * - Right-side action area (e.g., theme toggle passed via props)
 *
 * Props:
 * - onToggleTheme: function to toggle theme
 * - theme: "light" | "dark"
 */
export default function Header({ onToggleTheme, theme = "light" }) {
  return (
    <header className="bg-surface shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/90 text-white flex items-center justify-center font-semibold">
              TM
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-text">TaskMate</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Ocean Professional Dashboard</p>
            </div>
          </div>

          {/* Palette preview */}
          <div className="hidden md:flex items-center gap-2">
            <span className="h-5 w-5 rounded-md bg-primary" title="Primary" />
            <span className="h-5 w-5 rounded-md bg-secondary" title="Secondary" />
            <span className="h-5 w-5 rounded-md bg-success" title="Success" />
            <span className="h-5 w-5 rounded-md bg-error" title="Error" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <IconButton
              label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              icon={theme === "light" ? "🌙" : "☀️"}
              variant="ghost"
              onClick={onToggleTheme}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onToggleTheme: PropTypes.func,
  theme: PropTypes.oneOf(["light", "dark"]),
};
