const { fixupConfigRules } = require('@eslint/compat');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
  },
  ...fixupConfigRules(
    compat.extends(
      'next/core-web-vitals',
      'plugin:jsx-a11y/recommended',
      'prettier',
    ),
  ),
];
