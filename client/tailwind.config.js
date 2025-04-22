/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily : {
        'karla': ['Karla', 'sans-serif'], // Ensure fallback to a generic sans-serif font
        'montserrat': ['Montserrat', 'sans-serif'], // Same here
      },
    },
  },
  plugins: [],
}