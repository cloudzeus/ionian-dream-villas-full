"use client"
import { useEffect } from "react"

export default function MotionInit() {
  useEffect(() => {
    let active = true
    let revert: (() => void) | undefined

    ;(async () => {
      const { initPageMotion } = await import("@/lib/motion")
      if (!active) return
      revert = await initPageMotion(document.body)
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

  return null
}
