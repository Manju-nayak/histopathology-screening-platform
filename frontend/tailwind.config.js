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
          dark: 'var(--bg-color)',       // Sleek dynamic background
          panel: 'var(--panel-color)',   // Dynamic panels and cards
          border: 'var(--border-color)', // Dynamic border lines
          primary: '#0d9488',    // Teal-600
          primaryLight: '#14b8a6', // Teal-500
          accent: '#0891b2',     // Cyan-600
          accentLight: '#06b6d4', // Cyan-500
          success: '#059669',    // Emerald-600
          warning: '#d97706',    // Amber-600
          danger: '#dc2626',     // Red-600
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 0 20px 0 rgba(20, 184, 166, 0.15)',
        'glow-success': '0 0 20px 0 rgba(16, 185, 129, 0.15)',
        'glow-danger': '0 0 20px 0 rgba(239, 68, 68, 0.15)',
      }
    },
  },
  plugins: [],
}
