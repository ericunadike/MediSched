/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color, #2563eb)', // Uses dynamic primaryColor, falls back to #2563eb
        secondary: '#4f46e5', // Retains your secondary color
      },
      height: {
        'logo-sm': '4rem', // 64px for small screens
        'logo-md': '5rem', // 80px for medium screens
        'logo-lg': '6rem', // 96px for large screens
      },
      maxWidth: {
        'logo': '200px', // Caps logo width
      },
    },
  },
  plugins: [],
};
