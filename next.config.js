/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n.ts');
module.exports = withNextIntl({
  // Prevent Node.js built-ins and large packages from being bundled into serverless functions
  serverExternalPackages: ['sharp'],
  outputFileTracingExcludes: {
    '*': [
      './node_modules/@swc/**',
      './node_modules/webpack/**',
      './node_modules/terser/**',
      './public/**',
    ],
  },
  // Disable router cache so admin changes show immediately
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Serve uploaded images without aggressive caching
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
});
