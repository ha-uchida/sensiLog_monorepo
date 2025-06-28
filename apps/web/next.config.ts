import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  
  // 環境変数設定
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  },

  // 画像最適化設定 (static exportでは無効)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.valorant-api.com',
        port: '',
        pathname: '/**',
      },
    ],
  },


  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'chart.js'],
  },
};

export default nextConfig;
