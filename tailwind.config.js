/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        purple: {
          500: "#a855f7",
        },
        iceBlue: {
          400: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
}