/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


const nextConfig = {
  transpilePackages: ['@log-monitor/database', '@log-monitor/types'],
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Add support for importing from workspace packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@log-monitor/database': require.resolve('@log-monitor/database'),
      '@log-monitor/types': require.resolve('@log-monitor/types'),
    };

    return config;
  },
};

export default nextConfig; 