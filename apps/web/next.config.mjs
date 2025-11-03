
/** @type {import('next').NextConfig} */
const nextConfig = {

  allowedDevOrigins: [
    'app-notifications.terraviva.agr.br',
    'local.dev.terraviva'
  ],
  output: 'standalone',
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;