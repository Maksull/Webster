import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3001',
                pathname: '/public/img/**/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '3001',
                pathname: '/public/img/**/**',
            },
        ],
    },
    reactStrictMode: true,
};

export default nextConfig;
