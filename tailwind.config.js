// const plugin = require('tailwindcss/plugin')
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite/**/*.js',
  ],
  safelist: [
    '[&_th]:whitespace-nowrap',
    '[&_td]:whitespace-nowrap',
    '[&_th]:table-cell',
    '[&_td]:table-cell',
    '!font-bold',
    '!align-top',
    '!align-middle',
    '!align-bottom',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.yellow[300],
          lightest: colors.yellow[50],
          lighter: colors.yellow[100],
          darker: colors.yellow[400],
          darkest: colors.yellow[600],
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            'table th': {
              color: 'var(--tw-format-headings)',
              fontWeight: 600,
              verticalAlign: 'bottom',
              padding: '0.5555556em 0.5714286em 0.5714286em',
              backgroundColor: 'var(--tw-format-th-bg)',
            },
            table: {
              marginTop: 0,
              marginBottom: 0,
            },
          },
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
    require('flowbite-typography'),
    // plugin(function ({ addBase, addComponents, addUtilities, theme }) {
    //   addBase({
    //     'h1': {
    //       fontSize: theme('fontSize.2xl'),
    //     },
    //     'h2': {
    //       fontSize: theme('fontSize.xl'),
    //     },
    //   })
    //   addComponents({
    //     '.card': {
    //       backgroundColor: theme('colors.white'),
    //       borderRadius: theme('borderRadius.lg'),
    //       padding: theme('spacing.6'),
    //       boxShadow: theme('boxShadow.xl'),
    //     }
    //   })
    //   addUtilities({
    //     '.content-auto': {
    //       contentVisibility: 'auto',
    //     }
    //   })
    // })
  ],
};
