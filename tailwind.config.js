const plugin = require('tailwindcss/plugin');

const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '');
const em = (px, base) => `${round(px / base)}em`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            // ------------------------------
            // figure 要素 上書き
            // ------------------------------
            'figure, [role="figure"]': {
              marginLeft: 0,
              marginRight: 0,
              marginTop: em(32, 16),
              marginBottom: em(32, 16),
            },
            'figure img, [role="figure"] img': {
              marginTop: '0 !important',
              marginBottom: '0 !important',
            },

            // [role="figure"] のキャプションを figcaption と同等に
            '[role="figure"] .caption': {
              color: 'var(--tw-prose-captions)',
              fontSize: em(14, 16),
              lineHeight: round(20 / 14),
              marginTop: em(12, 14),
              marginBottom: '0',
            },
            'div:has(> table)': {
              overflowX: 'auto',
            },
            'thead th': {
              backgroundColor: 'var(--tw-format-th-bg)',
              color: 'var(--tw-format-headings)',
              fontWeight: '600',
              verticalAlign: 'bottom',
              padding: em(10, 18),
            },
            // ------------------------------
            // カラムレイアウト
            // ------------------------------
            "[data-type='columns']": {
              display: 'grid',
              gridAutoFlow: 'column',
              boxSizing: 'border-box',
              gap: '1em',
            },
            "[data-type='columns'].layout-two-column": {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            },
            "[data-type='columns'].layout-three-column": {
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            },

            // ------------------------------
            // 配置
            // ------------------------------
            // Align helpers
            '.align-left': {
              display: 'flex',
              justifyContent: 'flex-start',
            },
            '.align-right': {
              display: 'flex',
              justifyContent: 'flex-end',
            },
            '.align-center': {
              display: 'flex',
              justifyContent: 'center',
            },
            // ------------------------------
            // テーブルユーティリティ（acms）
            // ------------------------------
            '.acms-table-scrollable th, .acms-table-scrollable td, .js-table-unit-scroll-hint th, .js-table-unit-scroll-hint td':
              {
                whiteSpace: 'nowrap',
                wordBreak: 'keep-all',
              },
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({
      addBase,
      // addComponents,
      // addUtilities,
      theme,
    }) {
      addBase({
        html: {
          scrollPaddingTop: theme('spacing.20'),
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: theme('colors.white'),
          color: theme('colors.gray.900'),
        },
        '.dark body': {
          backgroundColor: theme('colors.gray.900'),
          color: theme('colors.white'),
        },
      });
      // addComponents({
      //   '.card': {
      //     backgroundColor: theme('colors.white'),
      //     borderRadius: theme('borderRadius.lg'),
      //     padding: theme('spacing.6'),
      //     boxShadow: theme('boxShadow.xl'),
      //   }
      // })
      // addUtilities({
      //   '.content-auto': {
      //     contentVisibility: 'auto',
      //   }
      // })
    }),
  ],
};
