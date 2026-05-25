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
          primary: '#3b82f6',    // Blue-500 (Cobalt Blue)
          primaryLight: '#60a5fa', // Blue-400
          accent: '#06b6d4',     // Cyan-500 (Electric Cyan)
          accentLight: '#22d3ee', // Cyan-400
          success: '#10b981',    // Emerald-500 (Mint Green)
          warning: '#f59e0b',    // Amber-500
          danger: '#ef4444',     // Red-500 (Coral Red)
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 0 20px 0 rgba(59, 130, 246, 0.15)',
        'glow-success': '0 0 20px 0 rgba(16, 185, 129, 0.15)',
        'glow-danger': '0 0 20px 0 rgba(239, 68, 68, 0.15)',
      }
    },
  },
  plugins: [],
}
