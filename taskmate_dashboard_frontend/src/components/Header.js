import React from "react";

// PUBLIC_INTERFACE
export default function Header() {
  /**
   * Header component of the dashboard.
   * Shows the app title and a simple brand bar.
   */
  return (
    <header className="bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-primary tracking-tight">
          TaskMate Dashboard
        </h1>
        <div className="text-xs sm:text-sm text-gray-500">
          Stay organized. Get things done.
        </div>
      </div>
    </header>
  );
}
