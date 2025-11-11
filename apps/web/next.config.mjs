
/** @type {import('next').NextConfig} */
const nextConfig = {

  allowedDevOrigins: [
    'app-notifications.terraviva.agr.br',
    'local.dev.terraviva',
    'catalogo.terraviva.agr.br'
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
        protocol: 'https',
        hostname: 'terravivabr.blob.core.windows.net',
        pathname: '/**'
      }, {
        protocol: 'https',
        hostname: 'megtv2.blob.core.windows.net',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;