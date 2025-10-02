/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: []
  },
  env: {
    METAL_PRICE_API_KEY: process.env.METAL_PRICE_API_KEY,
  }
}

module.exports = nextConfig