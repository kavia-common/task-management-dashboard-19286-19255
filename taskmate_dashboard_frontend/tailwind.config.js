/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      // Ocean Professional palette and semantic tokens
      colors: {
        // Core palette
        primary: "#2563EB", // Blue-600
        secondary: "#F59E0B", // Amber-500
        success: "#10B981", // Emerald-500 for success feedbacks
        error: "#EF4444", // Red-500
        background: "#f9fafb", // Gray-50
        surface: "#ffffff",
        text: "#111827", // Gray-900

        // Subtle tints for badges and accents
        "primary-50": "rgba(37, 99, 235, 0.06)",
        "secondary-50": "rgba(245, 158, 11, 0.08)",
        "success-50": "rgba(16, 185, 129, 0.08)",
        "error-50": "rgba(239, 68, 68, 0.08)",
      },
      backgroundImage: {
        "ocean-gradient": "linear-gradient(to bottom right, rgba(59,130,246,0.10), #f9fafb)",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(17, 24, 39, 0.06)",
        "soft-lg": "0 8px 24px rgba(17, 24, 39, 0.08)",
      },
      borderRadius: {
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
