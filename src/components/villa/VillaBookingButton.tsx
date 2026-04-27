"use client"
import { useState } from "react"
import BookingModal from "./BookingModal"

export default function VillaBookingButton({
  villaSlug,
  villaName,
  dark = false,
}: {
  villaSlug: string
  villaName: string
  dark?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: dark ? "relative" : "absolute",
          right: dark ? "auto" : 40,
          bottom: dark ? "auto" : 56,
          zIndex: 2,
          background: dark ? "white" : "white",
          color: "var(--color-ink)",
          border: "none",
          padding: "18px 32px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Book this villa →
      </button>
      <BookingModal villaSlug={villaSlug} villaName={villaName} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
