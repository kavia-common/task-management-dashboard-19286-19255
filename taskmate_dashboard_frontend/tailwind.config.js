/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#F59E0B",
        success: "#F59E0B",
        error: "#EF4444",
        background: "#f9fafb",
        surface: "#ffffff",
        text: "#111827",
      },
      backgroundImage: {
        "ocean-gradient": "linear-gradient(to bottom right, rgba(59,130,246,0.1), #f9fafb)",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(17, 24, 39, 0.06)",
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
