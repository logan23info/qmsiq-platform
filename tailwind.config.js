export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050d1a',
          900: '#0a1628',
          800: '#0f2044',
          700: '#162d5e',
          600: '#1e3a7a',
        },
        steel: {
          400: '#7b9cc4',
          300: '#a3bdd9',
          200: '#c8d9ec',
          100: '#e8f0f8',
        },
        amber: {
          audit: '#e8a020',
          light: '#fdf3dc',
        },
        emerald: {
          audit: '#1a7a5e',
          light: '#d4f0e8',
        },
        crimson: {
          audit: '#8b1a2e',
          light: '#f5d5db',
        }
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
