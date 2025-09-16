import React from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * Container
 *
 * Provides the page layout root container with Ocean Professional theme classes.
 * Creates a full-height surface with subtle gradient background, centers content,
 * and constrains max width for readability.
 *
 * Props:
 * - children: React nodes
 * - className: extra classes for the inner content wrapper
 * - fullWidth: when true, expands inner container to full width (default false)
 */
export default function Container({ children, className = "", fullWidth = false }) {
  return (
    <div className="min-h-screen bg-background bg-ocean-gradient">
      <main className={`mx-auto ${fullWidth ? "max-w-none" : "max-w-7xl"} px-4 sm:px-6 lg:px-8 py-6`}>
        {children}
      </main>
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};
