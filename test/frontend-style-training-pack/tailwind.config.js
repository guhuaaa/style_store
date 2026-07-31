/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 品牌主色
        brand: {
          50: '#F4F0E3',
          100: '#E7DDC1',
          200: '#CBB989',
          300: '#A99866',
          400: '#7F9274',
          500: '#40583B',
          600: '#344A31',
          700: '#2A3A28',
          800: '#202C1F',
          900: '#171F16',
          950: '#0F150E',
        },
        // 金融金
        gold: {
          50: '#FBF3D9',
          100: '#F0E2B7',
          200: '#DEC47D',
          300: '#CDA64A',
          400: '#C29A3C',
          500: '#AD7F2B',
          600: '#8F6423',
          700: '#6D4B1D',
          800: '#4D3418',
          900: '#312112',
        },
        // 风险红
        risk: {
          50: '#F7E9E4',
          100: '#EBC8BE',
          200: '#D89C8F',
          300: '#C76F61',
          400: '#B85A4C',
          500: '#9D493C',
          600: '#813C32',
          700: '#642F29',
          800: '#48231F',
          900: '#2F1815',
        },
        // 安全绿
        safe: {
          500: '#40583B',
          600: '#344A31',
        },
        // 暗色背景
        dark: {
          900: '#0B1120',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        // 亮背景
        surface: {
          50: '#FFF9EA',
          100: '#F3ECD9',
          200: '#E6D8B7',
        }
      },
      fontFamily: {
        sans: ['Avenir Next', 'Segoe UI', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Noto Serif SC', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.15)',
        'glow-blue': '0 0 20px rgba(53, 136, 176, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      }
    },
  },
  plugins: [],
}
