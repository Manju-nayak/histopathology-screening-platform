/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        medical: {
          dark: '#05070c',       // Sleek almost-black background
          panel: '#0e1322',      // Panels and cards
          border: 'rgba(255, 255, 255, 0.06)',
          primary: '#4f46e5',    // Indigo-600
          primaryLight: '#6366f1',
          accent: '#9333ea',     // Purple-600
          accentLight: '#a855f7',
          success: '#059669',    // Emerald-600
          warning: '#d97706',    // Amber-600
          danger: '#dc2626',     // Red-600
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 0 20px 0 rgba(99, 102, 241, 0.15)',
        'glow-success': '0 0 20px 0 rgba(16, 185, 129, 0.15)',
        'glow-danger': '0 0 20px 0 rgba(239, 68, 68, 0.15)',
      }
    },
  },
  plugins: [],
}
