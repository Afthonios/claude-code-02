import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Internationalization setup for next-intl
  experimental: {
    // Enable app directory features if needed
  },
  
  // Image optimization for Directus assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.afthonios.com',
        pathname: '/assets/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable static exports for ISG/SSG
  output: 'standalone',
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Remove manual redirects - next-intl middleware will handle locale routing
};

// Wrap the configuration with next-intl plugin
// This plugin integrates next-intl with Next.js
export default withNextIntl('./src/i18n.ts')(nextConfig);
