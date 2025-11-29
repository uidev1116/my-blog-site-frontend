/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.ACMS_ASSETS_PROTOCOL,
        hostname: process.env.ACMS_ASSETS_HOSTNAME,
        port: process.env.ACMS_ASSETS_PORT,
      },
    ],
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
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
