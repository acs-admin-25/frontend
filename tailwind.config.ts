import type { Config } from 'tailwindcss'
import { generateTailwindColors, greenTheme } from './lib/theme/simple-theme'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: generateTailwindColors(greenTheme),
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'arial'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        montserrat: ['var(--font-montserrat)', 'system-ui', 'arial'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'text-gradient': 'text-gradient 8s linear infinite',
        'gradient-bg': 'gradient-bg 8s ease-in-out infinite',
        'float-1': 'float-1 10s ease-in-out infinite',
        'float-2': 'float-2 12s ease-in-out infinite',
        'float-3': 'float-3 8s ease-in-out infinite',
        'slide-gradient': 'slide-gradient 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': '0% 50%',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': '100% 50%',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'text-gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': '0% center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': '100% center',
          },
        },
        'gradient-bg': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
            'background-position': '0% 50%'
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.02)',
            'background-position': '100% 50%'
          },
        },
        'float-1': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.6'
          },
          '50%': { 
            transform: 'translate(60px, -40px) scale(1.2)',
            opacity: '0.8'
          },
        },
        'float-2': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.6'
          },
          '50%': { 
            transform: 'translate(-50px, 35px) scale(0.8)',
            opacity: '0.8'
          },
        },
        'float-3': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.4'
          },
          '33%': { 
            transform: 'translate(30px, -20px) scale(1.1)',
            opacity: '0.6'
          },
          '66%': { 
            transform: 'translate(-20px, 30px) scale(0.9)',
            opacity: '0.4'
          },
        },
        'slide-gradient': {
          '0%': {
            'background-position': '-150% 50%',
          },
          '50%': {
            'background-position': '250% 50%',
          },
          '100%': {
            'background-position': '-150% 50%',
          },
        },
      },
      height: {
        'screen-dynamic': '100dvh',
      },
      minHeight: {
        'screen-dynamic': '100dvh',
      },
      maxHeight: {
        'screen-dynamic': '100dvh',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      lineClamp: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      const newUtilities = {
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '4',
        },
        '.line-clamp-5': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '5',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config 