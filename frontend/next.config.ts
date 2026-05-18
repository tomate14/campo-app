import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Genera un build standalone para el contenedor Docker
  output: 'standalone',

  // Reescribir llamadas /api/v1/* al backend para evitar CORS en producción
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
