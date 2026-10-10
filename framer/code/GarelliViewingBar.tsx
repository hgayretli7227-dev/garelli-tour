// Garelli Viewing Bar — a slim bar fixed to the bottom of house pages with the price and an
// "Arrange a viewing" button. It appears once the hero has scrolled away (scrollY > 90% of the
// screen) and hides as soon as the enquiry panel (Target Id) comes into view, or after it.
// Hidden = pointer-events none + aria-hidden, so it never blocks anything underneath.
// Status "Sold" renders nothing. Rendered into document.body so page transforms can't break `fixed`.
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const C = {
    ivory: "var(--token-8bd01df9-64d4-483f-8bb4-50a0e14ab145, #FBF8F2)",
    goldLine: "var(--token-4c371422-3d51-480d-adb7-60da8302532b, #CDB48A)",
    darkGold: "var(--token-7f4f9584-b23b-495c-b613-c2f968badb92, #9C7A4B)",
    taupe: "var(--token-366dba9c-e28d-4077-8569-62cc815287e9, #7B6E62)",
    ink: "var(--token-c7bc2552-cf7d-43e9-a114-200a3743f95c, #2B231D)",
}
const DISPLAY = `"Jost", "Jost Placeholder", "Helvetica Neue", Arial, sans-serif`
const BODY = `"Newsreader", "Newsreader Placeholder", Georgia, serif`

const CSS = `
.gvb { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9; background: ${C.ivory}; border-top: 1px solid ${C.goldLine};
  padding-bottom: env(safe-area-inset-bottom, 0px); transition: transform .3s cubic-bezier(.25,.1,.25,1), opacity .3s cubic-bezier(.25,.1,.25,1); }
.gvb[data-on="false"] { transform: translateY(100%); opacity: 0; pointer-events: none; }
.gvb[data-on="true"] { transform: translateY(0); opacity: 1; }
.gvb.gvb-static { position: relative; transform: none; opacity: 1; }
.gvb-in { box-sizing: border-box; max-width: 1440px; margin: 0 auto; height: 72px; padding: 0 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.gvb-info { display: flex; align-items: baseline; gap: 16px; min-width: 0; }
.gvb-name { font-family: ${DISPLAY}; font-weight: 300; font-size: 16px; letter-spacing: .14em; text-transform: uppercase; color: ${C.ink}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gvb-price { font-family: ${BODY}; font-size: 14px; color: ${C.taupe}; white-space: nowrap; }
.gvb-price.gvb-offer { color: ${C.darkGold}; }
.gvb-btn { all: unset; box-sizing: border-box; cursor: pointer; flex: 0 0 auto; background: ${C.darkGold}; color: ${C.ivory}; font-family: ${DISPLAY}; font-weight: 300; font-size: 13px;
  letter-spacing: .16em; text-transform: uppercase; padding: 14px 24px; text-align: center; transition: background-color .3s cubic-bezier(.44,0,.56,1); }
.gvb-btn:hover { background: ${C.ink}; }
.gvb-btn:focus-visible { outline: 1px solid ${C.ink}; outline-offset: 3px; }
@media (max-width: 1199.98px) { .gvb-in { padding: 0 40px; } }
@media (max-width: 809.98px) { .gvb-in { height: 64px; padding: 0 24px; gap: 16px; } .gvb-info { flex: 1 1 auto; } .gvb-name { display: none; } .gvb-price { white-space: normal; line-height: 1.25; } .gvb-btn { padding: 12px 18px; } }
@media (max-width: 359.98px) { .gvb-info { display: none; } .gvb-btn { flex: 1 1 auto; } }
@media (prefers-reduced-motion: reduce) { .gvb, .gvb[data-on="false"] { transform: none; transition: opacity .3s linear; } }
`

const money = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n)

interface Props {
    name: string
    price: number
    priceNote: string
    status: string
    targetId: string
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function GarelliViewingBar({ name, price, priceNote, status, targetId }: Props) {
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const sold = (status || "").trim().toLowerCase() === "sold"
    const [on, setOn] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (onCanvas || sold || typeof window === "undefined") return
        setMounted(true)
        const id = targetId || "enquiry"
        let target: HTMLElement | null = null
        let raf = 0
        const update = () => {
            raf = 0
            target = target && target.isConnected ? target : document.getElementById(id)
            const pastHero = window.scrollY > window.innerHeight * 0.9
            const nearTarget = target ? target.getBoundingClientRect().top < window.innerHeight : false
            setOn(pastHero && !nearTarget)
        }
        const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
        let io: IntersectionObserver | null = null
        const watch = () => {
            target = document.getElementById(id)
            if (target && "IntersectionObserver" in window) {
                io?.disconnect()
                io = new IntersectionObserver(schedule)
                io.observe(target)
            }
        }
        watch()
        const retry = target ? 0 : window.setTimeout(() => { watch(); schedule() }, 800)
        update()
        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)
        return () => {
            io?.disconnect()
            window.clearTimeout(retry)
            if (raf) cancelAnimationFrame(raf)
            window.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
        }
    }, [onCanvas, sold, targetId])

    if (sold) return null

    const offer = (status || "").trim().toLowerCase() === "under offer"
    const priceText = offer ? "Under offer" : [priceNote, typeof price === "number" && price > 0 ? money(price) : ""].filter(Boolean).join(" ")
    const go = () => {
        const el = document.getElementById(targetId || "enquiry")
        if (!el) return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    }

    const bar = (visible: boolean, isStatic: boolean) => (
        <div className={isStatic ? "gvb gvb-static" : "gvb"} data-on={visible ? "true" : "false"} aria-hidden={visible ? undefined : true} role="region" aria-label="Arrange a viewing">
            <style>{CSS}</style>
            <div className="gvb-in">
                <div className="gvb-info">
                    {name ? <span className="gvb-name">{name}</span> : null}
                    {priceText ? <span className={offer ? "gvb-price gvb-offer" : "gvb-price"}>{priceText}</span> : null}
                </div>
                <button type="button" className="gvb-btn" tabIndex={visible ? 0 : -1} onClick={isStatic ? undefined : go}>
                    Arrange a viewing
                </button>
            </div>
        </div>
    )

    if (onCanvas) return bar(true, true)
    return <div aria-hidden style={{ width: "100%", height: 0 }}>{mounted && typeof document !== "undefined" ? createPortal(bar(on, false), document.body) : null}</div>
}

addPropertyControls(GarelliViewingBar, {
    name: { type: ControlType.String, title: "Name", defaultValue: "Phillimore Place" },
    price: { type: ControlType.Number, title: "Price", defaultValue: 9750000, displayStepper: false },
    priceNote: { type: ControlType.String, title: "Price Note", defaultValue: "Guide price" },
    status: { type: ControlType.String, title: "Status", defaultValue: "For Sale" },
    targetId: { type: ControlType.String, title: "Target Id", defaultValue: "enquiry" },
})
