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
  trailingSlash: true,
};

module.exports = nextConfig;
