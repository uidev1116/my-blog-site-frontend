const nextConfig = require('eslint-config-next');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
  },
  // Next.js configuration (includes jsx-a11y)
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
  // Prettier config (disables conflicting rules) - must be last
  prettierConfig,
];
