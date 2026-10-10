// De foto's — Garelli Prestige Properties
// Raster van hero + kamerfoto's (3:2) met een lightbox op volledig scherm.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect, useMemo, useRef, useState, startTransition, type CSSProperties } from "react"
import { createPortal } from "react-dom"

interface ImageValue {
    src?: string
    srcSet?: string
    alt?: string
}

interface GarelliGalleryProps {
    style?: CSSProperties
    [key: string]: any
}

interface Photo {
    image: ImageValue
    caption: string
    hero?: boolean
}

// Alt-tekst: "Dining Room at Phillimore Place", "Front of Phillimore Place"; zonder woningnaam alleen het bijschrift
function altFor(photo: Photo, homeName: string): string {
    if (!homeName) return photo.caption
    return photo.hero ? `${photo.caption} of ${homeName}` : `${photo.caption} at ${homeName}`
}

const ROOM_COUNT = 10

// Kleurstijlen van het project, met de waarde als terugval
const C = {
    ivory: "var(--token-8bd01df9-64d4-483f-8bb4-50a0e14ab145, #FBF8F2)",
    goldLine: "var(--token-4c371422-3d51-480d-adb7-60da8302532b, #CDB48A)",
    taupe: "var(--token-366dba9c-e28d-4077-8569-62cc815287e9, #7B6E62)",
    ink: "var(--token-c7bc2552-cf7d-43e9-a114-200a3743f95c, #2B231D)",
}
const DISPLAY = `"Jost", "Jost Placeholder", "Helvetica Neue", Arial, sans-serif`

const pad = (n: number) => String(n).padStart(2, "0")
function text(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}
function hasImage(value: ImageValue | undefined): value is ImageValue {
    return !!value && typeof value.src === "string" && value.src.length > 0
}

const CSS = `
.gg-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
@media (max-width: 1199.98px) { .gg-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 809.98px) { .gg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; } }
.gg-tile { all: unset; box-sizing: border-box; display: block; cursor: pointer; aspect-ratio: 3 / 2; overflow: hidden; background: color-mix(in srgb, ${C.goldLine} 25%, ${C.ivory}); }
.gg-tile img { display: block; width: 100%; height: 100%; object-fit: cover; transition: filter .35s ease; }
.gg-tile:hover img { filter: brightness(1.07); }
.gg-tile:focus-visible { outline: 1px solid ${C.goldLine}; outline-offset: 3px; }
.gg-box { position: fixed; inset: 0; z-index: 1000; background: ${C.ivory}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 56px 88px 28px; box-sizing: border-box; }
.gg-stage { position: relative; display: grid; place-items: center; width: 100%; min-height: 0; touch-action: pan-y; }
.gg-stage img { grid-area: 1 / 1; display: block; max-width: 100%; max-height: 88vh; width: auto; height: auto; object-fit: contain; }
.gg-in { animation: gg-in .25s ease both; }
.gg-out { animation: gg-out .25s ease both; pointer-events: none; }
@keyframes gg-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes gg-out { from { opacity: 1; } to { opacity: 0; } }
.gg-meta { display: flex; gap: 22px; align-items: baseline; font-family: ${DISPLAY}; font-weight: 300; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: ${C.taupe}; text-align: center; }
.gg-meta span:last-child { font-variant-numeric: tabular-nums; white-space: nowrap; }
.gg-btn { all: unset; box-sizing: border-box; position: absolute; cursor: pointer; display: grid; place-items: center; color: ${C.ink}; }
.gg-btn:focus-visible { outline: 1px solid ${C.goldLine}; outline-offset: 2px; }
.gg-close { top: 14px; right: 14px; width: 44px; height: 44px; font-family: ${DISPLAY}; font-weight: 300; font-size: 30px; line-height: 1; }
.gg-prev, .gg-next { top: 50%; width: 56px; height: 72px; margin-top: -36px; }
.gg-prev { left: 16px; }
.gg-next { right: 16px; }
.gg-tap { display: none; }
@media (max-width: 809.98px) {
  .gg-box { padding: 56px 0 24px; }
  .gg-prev, .gg-next { display: none; }
  .gg-tap { all: unset; display: block; position: absolute; top: 0; bottom: 0; width: 50%; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .gg-tap-l { left: 0; }
  .gg-tap-r { right: 0; }
  .gg-meta { padding: 0 24px; gap: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .gg-tile img { transition: none; }
  .gg-in { animation: none; }
  .gg-stage .gg-out { display: none; }
}
`

function Arrow({ dir }: { dir: "left" | "right" }) {
    const d = dir === "left" ? "M30 2 L4 16 L30 30" : "M2 2 L28 16 L2 30"
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d={d} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
    )
}

/**
 * Garelli Gallery
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 600
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function GarelliGallery(props: GarelliGalleryProps) {
    const isStatic = useIsStaticRenderer()
    const homeName = text(props.homeName)

    // Hero eerst, dan kamer 1 t/m 10; lege foto's vallen weg
    const photos = useMemo(() => {
        const list: Photo[] = []
        if (hasImage(props.heroImage)) list.push({ image: props.heroImage, caption: "Front", hero: true })
        for (let r = 1; r <= ROOM_COUNT; r++) {
            const image = props[`room${r}Image`] as ImageValue | undefined
            if (hasImage(image)) list.push({ image, caption: text(props[`room${r}Name`]) || `Room ${r}` })
        }
        return list
    }, [props])

    const [open, setOpen] = useState<number | null>(null)
    const [prev, setPrev] = useState<number | null>(null)
    const tileRefs = useRef<(HTMLButtonElement | null)[]>([])
    const closeRef = useRef<HTMLButtonElement>(null)
    const lastTile = useRef<number | null>(null)
    const openRef = useRef<number | null>(null)
    const touchX = useRef<number | null>(null)
    const fadeTimer = useRef<number | undefined>(undefined)

    const count = photos.length
    const isOpen = open !== null && open < count

    // Bladert vanaf de laatst getoonde foto, ook bij snel achter elkaar drukken
    function step(delta: number) {
        const from = openRef.current
        if (from === null || count < 2) return
        const target = (from + delta + count) % count
        openRef.current = target
        window.clearTimeout(fadeTimer.current)
        startTransition(() => {
            setPrev(from)
            setOpen(target)
        })
        fadeTimer.current = window.setTimeout(() => startTransition(() => setPrev(null)), 260)
    }
    function openAt(i: number) {
        lastTile.current = i
        openRef.current = i
        startTransition(() => {
            setPrev(null)
            setOpen(i)
        })
    }
    function close() {
        openRef.current = null
        window.clearTimeout(fadeTimer.current)
        startTransition(() => {
            setOpen(null)
            setPrev(null)
        })
    }

    // Toetsen, body-scroll vast en focus zolang de lightbox open is
    useEffect(() => {
        if (!isOpen) return
        const html = document.documentElement
        const body = document.body
        const before = { html: html.style.overflow, body: body.style.overflow }
        html.style.overflow = "hidden"
        body.style.overflow = "hidden"
        closeRef.current?.focus()
        return () => {
            html.style.overflow = before.html
            body.style.overflow = before.body
            const tile = lastTile.current !== null ? tileRefs.current[lastTile.current] : null
            tile?.focus()
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault()
                close()
            } else if (e.key === "ArrowLeft") {
                e.preventDefault()
                step(-1)
            } else if (e.key === "ArrowRight") {
                e.preventDefault()
                step(1)
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    })

    useEffect(() => () => window.clearTimeout(fadeTimer.current), [])

    if (count === 0) return null

    const sizes = "(min-width: 1200px) 25vw, (min-width: 810px) 33vw, 50vw"
    const current = isOpen ? photos[open!] : null
    const previous = isOpen && prev !== null && prev !== open && prev < count ? photos[prev] : null

    const lightbox =
        current && typeof document !== "undefined"
            ? createPortal(
                  <div className="gg-box" role="dialog" aria-modal="true" aria-label="Photographs">
                      <style>{CSS}</style>
                      <div
                          className="gg-stage"
                          onTouchStart={(e) => {
                              touchX.current = e.touches[0].clientX
                          }}
                          onTouchEnd={(e) => {
                              if (touchX.current === null) return
                              const dx = e.changedTouches[0].clientX - touchX.current
                              touchX.current = null
                              if (Math.abs(dx) > 40) {
                                  e.preventDefault()
                                  step(dx < 0 ? 1 : -1)
                              }
                          }}
                      >
                          {previous && (
                              <img
                                  key={`out-${prev}`}
                                  className="gg-out"
                                  loading="eager"
                                  src={previous.image.src}
                                  srcSet={previous.image.srcSet}
                                  sizes="100vw"
                                  alt=""
                              />
                          )}
                          <img
                              key={`in-${open}`}
                              className={previous ? "gg-in" : undefined}
                              loading="eager"
                              src={current.image.src}
                              srcSet={current.image.srcSet}
                              sizes="100vw"
                              alt={altFor(current, homeName)}
                          />
                          <button type="button" className="gg-tap gg-tap-l" aria-label="Previous photograph" tabIndex={-1} onClick={() => step(-1)} />
                          <button type="button" className="gg-tap gg-tap-r" aria-label="Next photograph" tabIndex={-1} onClick={() => step(1)} />
                      </div>
                      <div className="gg-meta" aria-live="polite">
                          <span>{current.caption}</span>
                          <span>
                              {pad(open! + 1)} / {pad(count)}
                          </span>
                      </div>
                      <button ref={closeRef} type="button" className="gg-btn gg-close" aria-label="Close" onClick={close}>
                          ×
                      </button>
                      {count > 1 && (
                          <>
                              <button type="button" className="gg-btn gg-prev" aria-label="Previous photograph" onClick={() => step(-1)}>
                                  <Arrow dir="left" />
                              </button>
                              <button type="button" className="gg-btn gg-next" aria-label="Next photograph" onClick={() => step(1)}>
                                  <Arrow dir="right" />
                              </button>
                          </>
                      )}
                  </div>,
                  document.body
              )
            : null

    return (
        <div style={{ ...props.style, position: "relative", width: "100%" }}>
            <style>{CSS}</style>
            <div className="gg-grid">
                {photos.map((photo, i) => (
                    <button
                        key={i}
                        ref={(el) => {
                            tileRefs.current[i] = el
                        }}
                        type="button"
                        className="gg-tile"
                        aria-label={`Open photograph: ${photo.caption}`}
                        onClick={isStatic ? undefined : () => openAt(i)}
                    >
                        <img loading="lazy" src={photo.image.src} srcSet={photo.image.srcSet} sizes={sizes} alt={altFor(photo, homeName)} />
                    </button>
                ))}
            </div>
            {!isStatic && lightbox}
        </div>
    )
}

const controls: Record<string, any> = {
    homeName: { type: ControlType.String, title: "Home Name", defaultValue: "" },
    heroImage: { type: ControlType.ResponsiveImage, title: "Hero Image" },
}
for (let r = 1; r <= ROOM_COUNT; r++) {
    controls[`room${r}Name`] = { type: ControlType.String, title: `Room ${r} Name`, defaultValue: "" }
    controls[`room${r}Image`] = { type: ControlType.ResponsiveImage, title: `Room ${r} Image` }
}

addPropertyControls(GarelliGallery, controls)
