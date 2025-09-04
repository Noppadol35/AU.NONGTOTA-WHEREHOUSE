// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
//   reactStrictMode: true,
//   basePath: '/warehouse',
//   assetPrefix: '/warehouse/',
//   output: 'standalone',
  
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

module.exports = nextConfig;