/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#15171B',
        surface: '#1E2126',
        raised: '#262A31',
        line: '#33373E',
        accent: {
          DEFAULT: '#C1673B',
          soft: '#D98A63',
        },
        blueprint: {
          DEFAULT: '#7FA8B3',
          soft: '#4A6670',
        },
        ink: {
          DEFAULT: '#EDEAE3',
          muted: '#9498A0',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(rgba(127,168,179,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,168,179,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        blueprint: '32px 32px',
      },
    },
  },
  plugins: [],
}
