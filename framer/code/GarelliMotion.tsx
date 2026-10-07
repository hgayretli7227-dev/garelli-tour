// Garelli Motion — één onzichtbaar hulpcomponent in de layout (1×1 px, klikt nergens doorheen).
// Doet alleen wat Framer's eigen effecten niet kunnen:
//  · kaarten: foto zoomt binnen zijn kader (max 1.04) en de titel krijgt een gouden lijn bij hover
//  · kaartfoto's zoomen zacht in (1.06 → 1) als ze in beeld komen, gespreid per kaart
//  · de stappen op /sell komen gespreid omhoog in beeld, behalve als ze bij het laden al te zien zijn
//  · rustige parallax op full-bleed foto's (Desktop/Tablet) en een lichte zoom op de woninghero bij wegscrollen (Desktop)
// Alles staat uit bij prefers-reduced-motion. GarelliTour wordt niet aangeraakt.
import { addPropertyControls, RenderTarget } from "framer"
import { useEffect } from "react"

const GOLD = "var(--token-7f4f9584-b23b-495c-b613-c2f968badb92, #9C7A4B)"
const CARDS = ["Home Card", "Article Card", "Latest Item", "Related Home", "Partner Card", "Previous", "Next"]
const cardSel = CARDS.map((n) => `[data-framer-name="${n}"]`).join(",")
const IMG = "[data-framer-background-image-wrapper]"
const EASE = "cubic-bezier(.22,.61,.36,1)"
const FADE = '[data-framer-name="Steps"] > [data-framer-name^="Step "]'

const CSS = `
@media (hover: hover) and (pointer: fine) {
  ${CARDS.map((n) => `[data-framer-name="${n}"] ${IMG} img`).join(",")} { transition: transform 1s ${EASE}; }
  ${CARDS.map((n) => `[data-framer-name="${n}"]:hover ${IMG} img`).join(",")} { transform: scale(1.04); }
  [data-framer-name="Card Title"] .framer-text { text-decoration-line: underline; text-decoration-color: transparent; text-decoration-thickness: 1px; text-underline-offset: 6px; transition: text-decoration-color .6s ${EASE}; }
  ${CARDS.map((n) => `[data-framer-name="${n}"]:hover [data-framer-name="Card Title"] .framer-text`).join(",")} { text-decoration-color: ${GOLD}; }
}
html.gm [data-gm-r] ${IMG} { transition: opacity .9s ${EASE}, transform 1.2s ${EASE}; transition-delay: var(--gm-d, 0s); }
html.gm [data-gm-r]:not([data-gm-in]) ${IMG} { opacity: 0; transform: scale(1.06); }
@media (max-width: 809.98px) { html.gm [data-gm-r]:not([data-gm-in]) ${IMG} { transform: none; } html.gm [data-gm-r] ${IMG} { transition-duration: .6s; } }
html.gm [data-gm-f] { transition: opacity .9s ${EASE}, transform .9s ${EASE}; transition-delay: var(--gm-d, 0s); }
html.gm [data-gm-f]:not([data-gm-in]) { opacity: 0; transform: translateY(24px); }
@media (max-width: 809.98px) { html.gm [data-gm-f] { transition-delay: 0s; } }
html.gm-init [data-gm-f], html.gm-init [data-gm-r] ${IMG} { transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  html.gm [data-gm-f], html.gm [data-gm-f]:not([data-gm-in]) { opacity: 1 !important; transform: none !important; transition: none !important; }
  html.gm [data-gm-r] ${IMG}, html.gm [data-gm-r]:not([data-gm-in]) ${IMG} { opacity: 1 !important; transform: none !important; transition: none !important; }
  ${CARDS.map((n) => `[data-framer-name="${n}"] ${IMG} img`).join(",")} { transform: none !important; transition: none !important; }
}
`

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function GarelliMotion() {
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    useEffect(() => {
        if (typeof window === "undefined" || onCanvas) return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
        if (reduce.matches) return
        const root = document.documentElement

        // --- Kaartfoto's: zacht inzoomen bij binnenkomen -------------------------------------
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        ;(e.target as HTMLElement).setAttribute("data-gm-in", "")
                        io.unobserve(e.target)
                    }
                }
            },
            { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
        )
        const mark = () => {
            document.querySelectorAll<HTMLElement>(cardSel).forEach((card) => {
                if (card.hasAttribute("data-gm-r")) return
                if (!card.querySelector(IMG)) return
                card.setAttribute("data-gm-r", "")
                const parent = card.parentElement
                const i = parent ? Array.prototype.indexOf.call(parent.children, card) : 0
                card.style.setProperty("--gm-d", `${(i % 4) * 0.1}s`)
                // al in beeld bij laden: meteen zichtbaar, geen flits
                const r = card.getBoundingClientRect()
                if (r.top < window.innerHeight && r.bottom > 0) card.setAttribute("data-gm-in", "")
                else io.observe(card)
            })
            document.querySelectorAll<HTMLElement>(FADE).forEach((el) => {
                if (el.hasAttribute("data-gm-f")) return
                el.setAttribute("data-gm-f", "")
                const parent = el.parentElement
                const i = parent ? Array.prototype.indexOf.call(parent.children, el) : 0
                el.style.setProperty("--gm-d", `${(i % 4) * 0.12}s`)
                // al in het eerste scherm: meteen zichtbaar, geen fade
                const r = el.getBoundingClientRect()
                if (r.top < window.innerHeight && r.bottom > 0) el.setAttribute("data-gm-in", "")
                else io.observe(el)
            })
        }
        // verborgen startstand zonder overgang neerzetten, daarna pas animeren
        root.classList.add("gm-init")
        mark()
        root.classList.add("gm")
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("gm-init")))
        let pending = false
        const mo = new MutationObserver(() => {
            if (pending) return
            pending = true
            requestAnimationFrame(() => {
                pending = false
                mark()
            })
        })
        mo.observe(document.body, { childList: true, subtree: true })

        // --- Parallax (D/T) en hero-zoom (D) ----------------------------------------------------
        let ticking = false
        const update = () => {
            ticking = false
            const vh = window.innerHeight
            const w = window.innerWidth
            document.querySelectorAll<HTMLElement>('[data-framer-name="Parallax Photo"]').forEach((el) => {
                const wrap = el.querySelector<HTMLElement>(IMG)
                if (!wrap) return
                if (w < 810) {
                    wrap.style.transform = ""
                    return
                }
                const r = el.getBoundingClientRect()
                if (r.bottom < -100 || r.top > vh + 100) return
                const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2) // -1 … 1
                const shift = Math.max(-1, Math.min(1, p)) * r.height * 0.05
                wrap.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.12)`
            })
            document.querySelectorAll<HTMLElement>('[data-framer-name="Hero Photo"]').forEach((el) => {
                const wrap = el.querySelector<HTMLElement>(IMG)
                if (!wrap) return
                if (w < 1200) {
                    wrap.style.transform = ""
                    return
                }
                const r = el.getBoundingClientRect()
                const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)))
                wrap.style.transform = p > 0 ? `scale(${(1 + 0.04 * p).toFixed(4)})` : ""
            })
        }
        const onScroll = () => {
            if (!ticking) {
                ticking = true
                requestAnimationFrame(update)
            }
        }
        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        const offReduce = () => {
            if (reduce.matches) {
                document.querySelectorAll<HTMLElement>(IMG).forEach((wrap) => (wrap.style.transform = ""))
                window.removeEventListener("scroll", onScroll)
            }
        }
        reduce.addEventListener?.("change", offReduce)
        return () => {
            io.disconnect()
            mo.disconnect()
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
            reduce.removeEventListener?.("change", offReduce)
            root.classList.remove("gm", "gm-init")
        }
    }, [])

    return (
        <div aria-hidden style={{ width: 1, height: 1, overflow: "hidden", pointerEvents: "none" }}>
            {onCanvas ? null : <style>{CSS}</style>}
        </div>
    )
}

addPropertyControls(GarelliMotion, {})
