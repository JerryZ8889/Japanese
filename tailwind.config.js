/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#FF6B9D',
          teal: '#4ECDC4',
          yellow: '#FFE66D',
          lavender: '#C3B1E1',
        },
        background: {
          warm: '#FFF5F8',
          white: '#FFFFFF',
          light: '#F8F9FA',
        },
        functional: {
          success: '#00B894',
          warning: '#E17055',
          info: '#74B9FF',
          star: '#FDCB6E',
        },
      },
      fontFamily: {
        sans: ['Hiragino Sans', 'Yu Gothic', 'Meiryo', 'PingFang SC', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
