"use client"
import { useEffect, useRef } from "react"

export default function MotionInit() {
  const anchorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let active = true
    let revert: (() => void) | undefined

    const container =
      anchorRef.current?.parentElement ??
      document.querySelector("main") ??
      document.body

    ;(async () => {
      const { initPageMotion } = await import("@/lib/motion")
      if (!active) return
      revert = await initPageMotion(container)
      if (!active) {
        revert?.()
        revert = undefined
      }
    })()

    return () => {
      active = false
      revert?.()
    }
  }, [])

  return <span ref={anchorRef} aria-hidden style={{ display: "none" }} />
}
