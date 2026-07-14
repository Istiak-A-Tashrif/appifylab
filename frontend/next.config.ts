import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    const target = (process.env.API_PROXY_TARGET || 'http://localhost:3000').replace(/\/$/, '');
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/ddluuftiq/image/upload/**' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/uploads/**' },
    ],
  },
};
export default nextConfig;
