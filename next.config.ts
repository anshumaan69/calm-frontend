import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://140e-2401-4900-8fd9-3c92-60fe-1f72-ed0c-4f2f.ngrok-free.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
