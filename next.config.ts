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
  // X-Accel-Buffering: no tells Coolify's nginx proxy not to buffer streaming
  // responses. Without this, RSC client-side navigation requests are buffered
  // and dropped by the proxy, causing "This page couldn't load" on every Link click.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
