import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/ddluuftiq/image/upload/**' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/uploads/**' },
    ],
  },
};
export default nextConfig;
