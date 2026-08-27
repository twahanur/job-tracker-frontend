/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#EDEDF0',
        main: '#F9F9F9',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F8FAFC',
          hover: '#F2F7FF',
          muted: '#F1F1F5',
        },
        border: {
          DEFAULT: '#EFF0F6',
          subtle: '#E4E5E7',
          dark: '#D5D7E1',
        },
        charcoal: {
          DEFAULT: '#151E23',
          dark: '#0F172A',
          muted: '#4D4D4D',
        },
        text: {
          primary: '#151E23',
          secondary: '#4D4D4D',
          muted: '#6B6C7E',
          dim: '#848A95',
        },
        brand: {
          50: '#F2F7FF',
          100: '#E0EBFF',
          200: '#C7DAFE',
          300: '#9BBBFC',
          400: '#6497FA',
          500: '#1B59F8',
          600: '#1442B8',
          700: '#0F2552',
          800: '#0B1B3C',
          900: '#071126',
        },
        status: {
          emerald: '#2FEA9B',
          green: '#7FDD53',
          mint: '#1FE08F',
          sky: '#0EA5E9',
          amber: '#FFBF1A',
          coral: '#FF3E13',
          rose: '#FF4080',
          red: '#E51837',
        },
      },
      boxShadow: {
        card: '0 2px 10px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 24px rgba(27, 89, 248, 0.08)',
        dropdown: '0 10px 30px rgba(0, 0, 0, 0.08)',
        brand: '0 4px 14px rgba(27, 89, 248, 0.25)',
      },
      borderRadius: {
        '2xl': '1.125rem', // 18px
        '3xl': '1.5rem',   // 24px
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

