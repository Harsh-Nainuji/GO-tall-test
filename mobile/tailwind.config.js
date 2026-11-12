/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1D6AE5",
          purple: "#8B5CF6",
          green: "#22C55E",
          amber: "#F59E0B",
          dark: "#0F172A",
          surface: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};

