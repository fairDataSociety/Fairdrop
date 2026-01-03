/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fairdrop brand colors - coral theme matching fairdrop.xyz
        primary: {
          50: '#fff5f4',
          100: '#ffe8e6',
          200: '#ffd4d0',
          300: '#ffb3ac',
          400: '#ff8a80',
          500: '#FB4A36', // Main coral color - matches original fairdrop.xyz
          600: '#e84232',
          700: '#d13a2c',
          800: '#b33228',
          900: '#8f2820',
          950: '#4d1510',
        },
        // Fairdrop coral background
        coral: {
          DEFAULT: '#FB4A36',
          light: '#ff8a80',
          dark: '#e84232',
        },
        // Honest inbox / dropbox - blue
        dropbox: '#5580D2',
        // Send encrypted - green
        encrypted: '#37bd72',
        // Completion / download - dark gray
        completion: '#2E332F',
        // Settings panel - dark
        settings: '#1a1a1a',
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        // Dark mode background colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
