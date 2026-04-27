import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ioniandreamvillas.b-cdn.net" },
      { protocol: "https", hostname: "storage.bunnycdn.com" },
      { protocol: "https", hostname: "ionianback.wwa.gr" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
}

export default withNextIntl(nextConfig)
