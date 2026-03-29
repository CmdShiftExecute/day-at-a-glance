/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./data/**'],
    },
  },
};

export default nextConfig;
