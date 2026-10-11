/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的書き出し。out/ を Cloudflare の静的アセットとして配信する
  // (リダイレクトは public/_redirects、動的な処理は worker/ に置く)
  output: 'export',
  trailingSlash: true,
  // 標準の画像最適化は静的書き出しでは使えない
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
