/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  async rewrites() {
    return [
      {
        source:      '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://backend:8080/api/v1'}/:path*`,
      },
    ]
  },

  images: {
    remotePatterns: [],
  },
}

export default nextConfig
