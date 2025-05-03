// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [], // Peut être vide si vous n'utilisez pas les classes utilitaires dans les templates
    theme: {
      extend: {
        colors: {
          'custom-primary': '#007bff',
          'brand': {
            light: '#a0d2eb',
            DEFAULT: '#4ecdc4',
            dark: '#1a535c',
          }
        },
        spacing: {
          '7': '1.75rem', // 28px
        },
        fontFamily: {
           'sans': ['Inter', 'sans-serif'],
           'serif': ['Merriweather', 'serif'],
        },
        screens: {
          'lg': '1024px',
        }
      },
    },
    plugins: [],
  }