/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stores.hexalogicx.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'stores.hexalogicx.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;