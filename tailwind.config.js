const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
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
            'tbody th': {
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
  plugins: [require('flowbite/plugin'), require('flowbite-typography')],
};
