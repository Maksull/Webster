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

    // Webpack configuration to fix Konva canvas import issue
    webpack: (config, { isServer, webpack, dev }) => {
        // Only apply aggressive Konva fixes in production builds
        // In development with Turbopack, use minimal configuration
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false,
                fs: false,
                path: false,
                os: false,
            };

            // Only add aggressive fixes for production builds
            if (!dev) {
                config.resolve.fallback = {
                    ...config.resolve.fallback,
                    crypto: false,
                    stream: false,
                    util: false,
                    buffer: false,
                };

                // Replace server-side Konva modules with empty modules
                config.resolve.alias = {
                    ...config.resolve.alias,
                    'konva/lib/index-node.js': false,
                    'konva/lib/index-node': false,
                };

                // Use IgnorePlugin to ignore problematic modules
                config.plugins.push(
                    new webpack.IgnorePlugin({
                        resourceRegExp: /^canvas$/,
                        contextRegExp: /konva/,
                    }),
                );
            }
        }

        // For server-side, ignore canvas completely
        if (isServer) {
            config.externals = [...(config.externals || []), 'canvas'];
        }

        return config;
    },
};

export default nextConfig;
