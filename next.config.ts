import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ioniandreamvillas.b-cdn.net" },
      { protocol: "https", hostname: "storage.bunnycdn.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
    instrumentationHook: true,
  },
}

export default withNextIntl(nextConfig)
