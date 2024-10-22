/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#4375B5',
        'blue-900': '#1E3A8A',
        'blue-800': '#1E40AF',
        'blue-700': '#3B82F6',
        'teal-300': '#7F9CF5',
      },
      fontSize: {
        'xxs': '0.5rem', 
      },
      animation: {
        marquee: 'marquee 10s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  plugins: [
    require('daisyui'),
  ],
  darkMode: 'class', // หรือ 'media'
};
