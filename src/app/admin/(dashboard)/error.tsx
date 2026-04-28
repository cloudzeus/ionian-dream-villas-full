"use client"

import { useEffect } from "react"

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[admin error boundary]", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8">
      <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Error</p>
      <h2 className="text-2xl font-light">Something went wrong loading this page.</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        This is usually a brief database hiccup. Try again — it should recover immediately.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="px-6 py-3 bg-foreground text-background text-xs font-mono uppercase tracking-widest hover:opacity-80 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
