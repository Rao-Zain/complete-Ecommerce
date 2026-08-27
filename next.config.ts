/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.1.5",
        port: "8008",
        pathname: "/storage/**",
      },
    ],
  },
};

module.exports = nextConfig;