/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#090d16',
          card: '#111726',
          'card-hover': '#161e31',
          border: '#1e293b',
          accent: '#10b981',
          cyan: '#06b6d4',
          rose: '#f43f5e',
          amber: '#f59e0b',
          blue: '#3b82f6',
          dark: '#05070c'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace', 'ui-monospace'],
      }
    },
  },
  plugins: [],
}
