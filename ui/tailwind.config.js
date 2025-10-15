/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-bg': '#f5f5f7',
        'apple-blue': '#007aff',
        'apple-gray': '#86868b',
        'apple-dark': '#1d1d1f',
      },
      fontFamily: {
        'sf': ['SF Pro Display', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 4px 20px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'apple': '16px',
      }
    },
  },
  plugins: [],
}
