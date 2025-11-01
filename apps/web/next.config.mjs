
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
      new URL('https://planti.blob.core.windows.net/**'),
      new URL('https://megtv2.blob.core.windows.net/**'),
      new URL('https://apiweb.terraviva.agr.br/**'),
    ]
  }
};

export default nextConfig;