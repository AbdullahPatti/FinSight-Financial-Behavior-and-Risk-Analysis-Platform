/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
        body: ["Crimson Pro", "Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
}

