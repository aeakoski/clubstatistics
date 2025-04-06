/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side: exclude server-only modules
      config.resolve.fallback = {
        fs: false,
        path: false,
        child_process: false,
        crypto: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        '@google-cloud/bigquery': false
      };
    }
    return config;
  }
};

module.exports = nextConfig; 