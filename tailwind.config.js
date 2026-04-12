/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f8f2e8",
        parchment: "#e8d9c4",
        ink: "#2f241f",
        muted: "#715f53",
        accent: "#a6501f",
        "accent-deep": "#7a3814",
        "accent-soft": "#e8b07d",
        panel: "rgba(255, 250, 244, 0.82)",
        "panel-strong": "rgba(255, 248, 238, 0.96)",
        border: "rgba(103, 66, 43, 0.18)",
      },
      boxShadow: {
        panel: "0 22px 55px rgba(78, 47, 27, 0.14)",
        action: "0 10px 24px rgba(122, 56, 20, 0.2)",
      },
      fontFamily: {
        sans: ["Trebuchet MS", "Segoe UI", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["Consolas", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
