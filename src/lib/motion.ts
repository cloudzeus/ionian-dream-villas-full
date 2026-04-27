"use client"

export async function initPageMotion(container: Element) {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const { gsap } = await import("gsap")
  const { ScrollTrigger } = await import("gsap/ScrollTrigger")
  gsap.registerPlugin(ScrollTrigger)

  const ctx = gsap.context(() => {

    // ── Clip-reveal images ───────────────────────────────────────────────
    gsap.utils.toArray<Element>(".x-clip-reveal").forEach((el) => {
      gsap.fromTo(el,
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 },
        {
          clipPath: "inset(0% 0% 0% 0%)", scale: 1,
          duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      )
    })

    // ── Fade-up text blocks ──────────────────────────────────────────────
    gsap.utils.toArray<Element>(".x-fade").forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      )
    })

    // ── Staggered children ───────────────────────────────────────────────
    gsap.utils.toArray<Element>(".x-stagger").forEach((parent) => {
      gsap.fromTo(Array.from(parent.children),
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: parent, start: "top 85%", once: true },
        }
      )
    })

    // ── Parallax images ──────────────────────────────────────────────────
    gsap.utils.toArray<Element>(".x-parallax-img").forEach((el) => {
      gsap.fromTo(el,
        { yPercent: -10 },
        {
          yPercent: 10, ease: "none",
          scrollTrigger: {
            trigger: el.closest(".x-parallax-row") || el,
            start: "top bottom", end: "bottom top", scrub: 1.5,
          },
        }
      )
    })

    // ── Villa card reveal ────────────────────────────────────────────────
    gsap.utils.toArray<Element>(".x-villa-row").forEach((el) => {
      const img = el.querySelector(".x-villa-img")
      const content = el.querySelector(".x-villa-content")

      if (img) {
        gsap.fromTo(img,
          { clipPath: "inset(8% 8% 8% 8%)", scale: 1.1 },
          {
            clipPath: "inset(0% 0% 0% 0%)", scale: 1,
            duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          }
        )
      }

      if (content) {
        gsap.fromTo(Array.from(content.children),
          { opacity: 0, y: 35 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 78%", once: true },
          }
        )
      }
    })

    // ── Marquee ──────────────────────────────────────────────────────────
    const marquee = document.querySelector<HTMLElement>(".x-marquee-track")
    if (marquee) {
      gsap.to(marquee, {
        xPercent: -50, ease: "none",
        repeat: -1, duration: 28,
      })
    }

    // ── Hero load reveal ─────────────────────────────────────────────────
    const heroLines = document.querySelectorAll(".x-hero-line")
    if (heroLines.length) {
      gsap.fromTo(heroLines,
        { opacity: 0, y: 70 },
        { opacity: 1, y: 0, duration: 1.6, ease: "expo.out", stagger: 0.18, delay: 0.2 }
      )
    }
    const heroMeta = document.querySelectorAll(".x-hero-meta")
    if (heroMeta.length) {
      gsap.fromTo(heroMeta,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power2.out", stagger: 0.08, delay: 1.1 }
      )
    }

    // ── Hero BG parallax on scroll ───────────────────────────────────────
    const heroBg = document.querySelector<HTMLElement>(".x-hero-bg")
    const heroSection = document.querySelector<HTMLElement>(".x-hero-section")
    if (heroBg && heroSection) {
      gsap.to(heroBg, {
        yPercent: 22, ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }

    // ── Section line wipe ────────────────────────────────────────────────
    gsap.utils.toArray<Element>(".x-line-wipe").forEach((el) => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      )
    })

  }, container)

  return () => {
    ScrollTrigger.getAll().forEach(t => t.kill())
    ctx.revert()
  }
}
