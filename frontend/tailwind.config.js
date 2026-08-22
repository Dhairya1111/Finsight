/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9eeff",
          200: "#bce2ff",
          300: "#8fd0ff",
          400: "#5ab5ff",
          500: "#2b94f4",
          600: "#1575d6",
          700: "#145ead",
          800: "#154f8d",
          900: "#174375",
        },
      },
      boxShadow: {
        card: "0 14px 40px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        glow: "radial-gradient(circle at top right, rgba(43,148,244,0.18), transparent 42%)",
      },
    },
  },
  plugins: [],
};
