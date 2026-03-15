/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg:      '#08080f',
          surface: '#0d0d1a',
          card:    '#111120',
          border:  '#1e1e35',
          accent:  '#4f8ef7',
          gold:    '#f5a623',
          red:     '#e53935',
          text:    '#f0ebe0',
          muted:   '#7a7a9a',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' },
                   to:   { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        shimmer:   'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up':'slideUp 0.5s ease forwards',
      },
    },
  },
  plugins: [],
}
