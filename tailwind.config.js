/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#07111f',
        panel: '#0d1b2d',
        line: '#1e3654',
        cyan: '#27d9ff',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 32px rgba(39, 217, 255, 0.18)',
      },
    },
  },
  plugins: [],
};
