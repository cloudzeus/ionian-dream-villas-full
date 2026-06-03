// ─── Lightweight anti-spam for public enquiry forms ──────────────────────────
//
// Three layers, no external service / keys required:
//   1. Honeypot   — a hidden field real users never fill; bots usually do.
//   2. Time-trap  — reject submissions that arrive implausibly fast (bots
//                   submit in milliseconds; humans take seconds to fill a form).
//   3. Rate-limit — cap submissions per client IP within a sliding window.
//
// The rate-limiter is a simple in-process Map. It resets on redeploy and is
// per-instance — good enough to stop casual abuse. For multi-instance scale,
// swap the store for Redis/Upstash behind the same `checkRateLimit` API.

export const HONEYPOT_FIELD = "company_website"
export const TIMESTAMP_FIELD = "form_loaded_at"

// Minimum seconds a genuine user needs to fill the form.
const MIN_FILL_SECONDS = 3
// Reject stale tokens (older than this) to limit token replay.
const MAX_FORM_AGE_SECONDS = 60 * 60 // 1 hour

const RATE_LIMIT_MAX = 5 // submissions...
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // ...per 10 minutes per IP

type Hit = { count: number; resetAt: number }
const buckets = new Map<string, Hit>()

// Opportunistic cleanup so the Map can't grow unbounded across many IPs.
// Runs only when the Map gets large, and only drops already-expired entries.
const SWEEP_THRESHOLD = 5000
function sweepExpired(now: number) {
  if (buckets.size < SWEEP_THRESHOLD) return
  for (const [ip, hit] of buckets) {
    if (now > hit.resetAt) buckets.delete(ip)
  }
}

/** Best-effort client IP from common proxy headers. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return headers.get("x-real-ip") || "unknown"
}

/** Sliding-window per-IP rate limit. Returns false when the cap is exceeded. */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  sweepExpired(now)
  const hit = buckets.get(ip)

  if (!hit || now > hit.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (hit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) }
  }

  hit.count += 1
  return { allowed: true }
}

/**
 * Validate honeypot + timing signals.
 * Returns `{ spam: true, reason }` when the submission looks automated.
 */
export function checkContentSignals(input: {
  honeypot?: unknown
  loadedAt?: unknown
}): { spam: boolean; reason?: string } {
  // 1. Honeypot must be empty.
  if (typeof input.honeypot === "string" && input.honeypot.trim() !== "") {
    return { spam: true, reason: "honeypot" }
  }

  // 2. Time-trap. Missing/garbage timestamp is treated as suspicious.
  const loadedAt = Number(input.loadedAt)
  if (!Number.isFinite(loadedAt) || loadedAt <= 0) {
    return { spam: true, reason: "missing-timestamp" }
  }
  const elapsedSeconds = (Date.now() - loadedAt) / 1000
  if (elapsedSeconds < MIN_FILL_SECONDS) {
    return { spam: true, reason: "too-fast" }
  }
  if (elapsedSeconds > MAX_FORM_AGE_SECONDS) {
    return { spam: true, reason: "stale" }
  }

  return { spam: false }
}
