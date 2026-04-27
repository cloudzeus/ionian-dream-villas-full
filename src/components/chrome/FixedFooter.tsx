"use client"
import { useTranslations } from "next-intl"

export default function FixedFooter() {
  const t = useTranslations("footer")
  return (
    <>
      <div style={{ height: 64 }} />
      <footer
        className="x-fixed-footer"
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 40,
          background: "var(--color-bg-deep)",
          color: "rgba(247,244,238,0.7)",
          padding: "0 40px",
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--color-rule-light)",
        }}
      >
        <span className="mono-label" style={{ color: "rgba(247,244,238,0.5)" }}>
          {t("copy")}
        </span>
        <span className="x-fixed-footer-location mono-label" style={{ color: "rgba(247,244,238,0.5)" }}>
          {t("location")}
        </span>
        <a
          href={`mailto:${t("email")}`}
          className="mono-label"
          style={{ color: "var(--color-accent)", textDecoration: "none" }}
        >
          {t("email")}
        </a>
      </footer>
    </>
  )
}
