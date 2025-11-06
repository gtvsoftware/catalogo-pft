
/** @type {import('next').NextConfig} */
const nextConfig = {

  allowedDevOrigins: [
    'app-notifications.terraviva.agr.br',
    'local.dev.terraviva',
  ],
  output: 'standalone',
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true
  },
  turbopack: {},
  images: {
    remotePatterns: [
      new URL('https://terravivabr.blob.core.windows.net/**')]
  },
};

export default nextConfig;