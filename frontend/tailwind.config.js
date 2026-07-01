/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark color palette
        brand: {
          50: '#f4f6fa',
          100: '#e9edf5',
          200: '#cbd5e8',
          300: '#9cb1d4',
          400: '#6889bd',
          500: '#466aa6',
          600: '#35538b',
          700: '#2b4372',
          800: '#263960',
          900: '#213050',
          950: '#141d32',
        },
        slate: {
          950: '#0b0f19',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
