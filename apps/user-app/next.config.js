/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  // Disable unnecessary features for optimization
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  // Webpack optimizations
  webpack: (config) => {
    // Only apply client-side fallbacks
    if (!config.name.includes('server')) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }

    // Important: return the modified config
    return config;
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@repo/ui'],
    serverComponentsExternalPackages: ['bcrypt', 'aws-sdk'],
  },
};

export default nextConfig;