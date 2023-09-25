/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.uidev.jp',
      },
    ],
  },
  trailingSlash: true,
};

module.exports = nextConfig;
