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
          primary: '#6366f1',    // Indigo-500
          primaryLight: '#818cf8', // Indigo-400
          accent: '#10b981',     // Emerald-500
          accentLight: '#34d399', // Emerald-400
          success: '#10b981',    // Emerald-500
          warning: '#f59e0b',    // Amber-500
          danger: '#ef4444',     // Red-500
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 0 20px 0 rgba(99, 102, 241, 0.25)',
        'glow-success': '0 0 20px 0 rgba(16, 185, 129, 0.15)',
        'glow-danger': '0 0 20px 0 rgba(239, 68, 68, 0.15)',
      }
    },
  },
  plugins: [],
}
