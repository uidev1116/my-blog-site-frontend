/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.ACMS_ASSETS_HOST,
      },
    ],
  },
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/blog/entry-106.html',
        destination: '/blog/ablogcms-next-rss-feed.html',
        permanent: true,
      },
    ];
  },
  trailingSlash: true,
};

module.exports = nextConfig;
