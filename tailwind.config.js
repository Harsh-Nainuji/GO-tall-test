/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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

