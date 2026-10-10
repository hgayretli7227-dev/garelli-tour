// De rondleiding — Garelli Prestige Properties
// Plattegrond plakt links (≥ 810px) of als balk bovenaan (telefoon); kamers scrollen ernaast.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect, useMemo, useRef, useState, startTransition, type CSSProperties } from "react"
import { createPortal } from "react-dom"

interface ImageValue {
    src?: string
    srcSet?: string
    alt?: string
}

interface GarelliTourProps {
    style?: CSSProperties
    [key: string]: any
}

interface Floor {
    index: number // 0-based position among floors 1–5
    name: string
    plan?: ImageValue
    rooms: number[] // indexes into rooms
}

interface Room {
    name: string
    image?: ImageValue
    text: string
    floor: number // 0-based floor index (1–5 in the CMS)
    x: number
    y: number
}

const FLOOR_COUNT = 5
const ROOM_COUNT = 10

// Kleurstijlen van het project, met de waarde als terugval
const C = {
    ivory: "var(--token-8bd01df9-64d4-483f-8bb4-50a0e14ab145, #FBF8F2)",
    champagne: "var(--token-d73f2bf1-4200-4643-9bb4-1f84e263a1ce, #F6F0E6)",
    goldLine: "var(--token-4c371422-3d51-480d-adb7-60da8302532b, #CDB48A)",
    gold: "var(--token-7f4f9584-b23b-495c-b613-c2f968badb92, #9C7A4B)",
    taupe: "var(--token-366dba9c-e28d-4077-8569-62cc815287e9, #7B6E62)",
    ink: "var(--token-c7bc2552-cf7d-43e9-a114-200a3743f95c, #2B231D)",
}
const DISPLAY = `"Jost", "Jost Placeholder", "Helvetica Neue", Arial, sans-serif`
const BODY = `"Newsreader", "Newsreader Placeholder", Georgia, serif`

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
const pad = (n: number) => String(n).padStart(2, "0")
const plural = (n: number, word: string) => `${n === 1 ? word : word + "s"}`
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function num(value: unknown): number | null {
    const n = typeof value === "string" ? parseFloat(value) : (value as number)
    return typeof n === "number" && isFinite(n) ? n : null
}
function text(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}
function hasImage(value: ImageValue | undefined): boolean {
    return !!value && typeof value.src === "string" && value.src.length > 0
}

const CSS = `
.gt-mk { position: absolute; width: 30px; height: 30px; margin: -15px 0 0 -15px; border: 0; padding: 0; background: none; cursor: pointer; }
.gt-mk::after { content: ""; position: absolute; inset: 10px; border-radius: 50%; border: 1px solid ${C.taupe}; background: ${C.champagne}; transition: border-color .2s; }
.gt-mk:hover::after, .gt-mk:focus-visible::after { border-color: ${C.gold}; }
.gt-mk:focus-visible { outline: 1px solid ${C.gold}; outline-offset: 2px; border-radius: 50%; }
.gt-phone .gt-mk { pointer-events: none; width: 12px; height: 12px; margin: -6px 0 0 -6px; }
.gt-phone .gt-mk::after { inset: 3px; }
.gt-here { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: ${C.gold}; pointer-events: none; box-shadow: 0 0 0 5px color-mix(in srgb, ${C.gold} 18%, transparent); transition: left .7s cubic-bezier(.6,0,.2,1), top .7s cubic-bezier(.6,0,.2,1); }
.gt-here::after { content: ""; position: absolute; inset: -5px; border-radius: 50%; border: 1px solid ${C.gold}; animation: gt-ring 2.6s ease-out infinite; }
.gt-phone .gt-here { width: 8px; height: 8px; margin: -4px 0 0 -4px; box-shadow: 0 0 0 3px color-mix(in srgb, ${C.gold} 20%, transparent); }
.gt-phone .gt-here::after { inset: -3px; }
@keyframes gt-ring { from { transform: scale(1); opacity: .7; } to { transform: scale(2.6); opacity: 0; } }
.gt-floor { transition: opacity .5s ease, visibility 0s .5s; }
.gt-floor.gt-on { transition: opacity .5s ease; }
.gt-floorbtn { all: unset; box-sizing: border-box; cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid color-mix(in srgb, ${C.goldLine} 45%, transparent); font-family: ${DISPLAY}; font-weight: 300; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: ${C.taupe}; }
.gt-floorbtn:first-child { border-bottom: 0; }
.gt-floorbtn.gt-on { color: ${C.ink}; }
.gt-floorbtn.gt-on .gt-fname::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${C.gold}; margin-right: 10px; vertical-align: 2px; }
.gt-floorbtn:focus-visible, .gt-btn:focus-visible, .gt-pick:focus-visible { outline: 1px solid ${C.gold}; outline-offset: 2px; }
.gt-btn { font-family: ${DISPLAY}; font-weight: 300; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; background: none; border: 1px solid ${C.gold}; color: ${C.ink}; padding: 10px 12px; cursor: pointer; flex: 0 0 auto; border-radius: 0; }
.gt-x { all: unset; cursor: pointer; font-family: ${DISPLAY}; font-weight: 300; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: ${C.gold}; padding: 8px 0; }
.gt-x:focus-visible { outline: 1px solid ${C.gold}; outline-offset: 2px; }
.gt-pick { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 14px; width: 100%; padding: 11px 0; border-bottom: 1px solid color-mix(in srgb, ${C.goldLine} 50%, transparent); font-family: ${DISPLAY}; font-weight: 300; font-size: 15px; letter-spacing: .1em; text-transform: uppercase; color: ${C.ink}; }
.gt-pick span { color: ${C.gold}; font-size: 12px; min-width: 22px; font-variant-numeric: tabular-nums; }
.gt-pick.gt-on { color: ${C.gold}; }
@media (prefers-reduced-motion: reduce) {
  .gt-here, .gt-floor, .gt-floor.gt-on { transition: none; }
  .gt-here::after { animation: none; }
}
`

const caption: CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 300,
    fontSize: 12,
    lineHeight: 1.25,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
}

const label: CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 300,
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: C.taupe,
}

/**
 * Garelli Tour
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 720
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function GarelliTour(props: GarelliTourProps) {
    const isStatic = useIsStaticRenderer()

    // Gegevens uit de vaste CMS-velden; lege kamers en lege verdiepingen vallen weg
    const { floors, rooms } = useMemo(() => {
        const rawFloors = Array.from({ length: FLOOR_COUNT }, (_, f) => ({
            name: text(props[`floor${f + 1}Name`]),
            plan: props[`floor${f + 1}Plan`] as ImageValue | undefined,
        }))
        const rooms: Room[] = []
        for (let r = 1; r <= ROOM_COUNT; r++) {
            const name = text(props[`room${r}Name`])
            if (!name) continue
            const floor = Math.round(num(props[`room${r}Floor`]) ?? 0) - 1
            const raw = rawFloors[floor]
            if (!raw || (!raw.name && !hasImage(raw.plan))) continue
            rooms.push({
                name,
                image: props[`room${r}Image`],
                text: text(props[`room${r}Text`]),
                floor,
                x: Math.min(100, Math.max(0, num(props[`room${r}PlanX`]) ?? 50)),
                y: Math.min(100, Math.max(0, num(props[`room${r}PlanY`]) ?? 50)),
            })
        }
        const floors: Floor[] = []
        rawFloors.forEach((raw, f) => {
            const own = rooms.map((room, i) => (room.floor === f ? i : -1)).filter((i) => i >= 0)
            if (own.length) floors.push({ index: f, name: raw.name || `Floor ${f + 1}`, plan: raw.plan, rooms: own })
        })
        return { floors, rooms }
    }, [props])

    const rootRef = useRef<HTMLElement>(null)
    const panelRef = useRef<HTMLElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)
    const roomRefs = useRef<(HTMLElement | null)[]>([])
    const roomsWrapRef = useRef<HTMLDivElement>(null)
    const pendingRef = useRef<{ i: number; until: number } | null>(null)
    const reduceRef = useRef(false)
    const openRef = useRef<HTMLButtonElement>(null)
    const captionRef = useRef<HTMLDivElement>(null)
    const captionMeasureRef = useRef<HTMLSpanElement>(null)
    const [showFloor, setShowFloor] = useState(true)
    const closeRef = useRef<HTMLButtonElement>(null)

    // Breedte van de eigen container (niet van het venster): de canvas toont alle breakpoints naast elkaar
    const [width, setWidth] = useState<number | null>(null)
    const [stage, setStage] = useState({ w: 0, h: 0 })
    const [panelHeight, setPanelHeight] = useState(0)
    const [natural, setNatural] = useState<Record<number, { w: number; h: number }>>({})
    const [reduce, setReduce] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [view, setView] = useState({ active: 0, visit: 0, floorPos: {} as Record<number, { x: number; y: number }> })

    const phone = width !== null && width < 810
    const zoom = Math.min(3, Math.max(1, num(props.phonePlanZoom) ?? 1.4))
    const gutter = width === null || width >= 1200 ? 64 : width >= 810 ? 40 : 24

    useEffect(() => {
        const el = rootRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((entries) => {
            const w = Math.round(entries[0].contentRect.width)
            setWidth((prev) => (prev === w ? prev : w))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        const el = stageRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((entries) => {
            const { width: w, height: h } = entries[0].contentRect
            setStage((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [rooms.length > 0])

    useEffect(() => {
        const el = panelRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((entries) => {
            const h = Math.round(entries[0].borderBoxSize?.[0]?.blockSize ?? entries[0].contentRect.height)
            setPanelHeight((prev) => (prev === h ? prev : h))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [rooms.length > 0])

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const update = () => {
            reduceRef.current = mq.matches
            setReduce(mq.matches)
        }
        update()
        mq.addEventListener?.("change", update)
        return () => mq.removeEventListener?.("change", update)
    }, [])

    const setActive = (i: number) => {
        setView((prev) => {
            if (i === prev.active && prev.floorPos[rooms[i]?.floor] ) return prev
            const room = rooms[i]
            if (!room) return prev
            const prevFloor = rooms[prev.active]?.floor
            return {
                active: i,
                visit: room.floor !== prevFloor ? prev.visit + 1 : prev.visit,
                floorPos: { ...prev.floorPos, [room.floor]: { x: room.x, y: room.y } },
            }
        })
    }

    // Actieve kamer = laatste kamer waarvan de bovenkant boven 45% van het venster ligt
    useEffect(() => {
        if (isStatic || typeof window === "undefined" || !rooms.length) return
        const update = () => {
            const line = window.innerHeight * 0.45
            let i = 0
            roomRefs.current.forEach((el, n) => {
                if (el && n < rooms.length && el.getBoundingClientRect().top < line) i = n
            })
            setActive(i)
        }
        update()
        window.addEventListener("scroll", update, { passive: true })
        window.addEventListener("resize", update)
        return () => {
            window.removeEventListener("scroll", update)
            window.removeEventListener("resize", update)
        }
    }, [isStatic, rooms])

    // Telefoon: verdieping alleen tonen als "verdieping · kamer" op één regel past; de kamernaam wordt nooit afgekapt
    const captionKey = rooms.length ? `${rooms[Math.min(view.active, rooms.length - 1)].name}|${rooms[Math.min(view.active, rooms.length - 1)].floor}` : ""
    useEffect(() => {
        const box = captionRef.current
        const measure = captionMeasureRef.current
        if (!phone || !box || !measure) return
        const update = () => {
            const fits = measure.getBoundingClientRect().width <= box.clientWidth + 0.5
            setShowFloor((prev) => (prev === fits ? prev : fits))
        }
        update()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(update)
        ro.observe(box)
        return () => ro.disconnect()
    }, [phone, captionKey])

    // Foto's laden lui en verschuiven de kamers: na een sprong het doel opnieuw uitlijnen
    // zolang de bezoeker zelf niet scrolt (hoogstens 3 seconden)
    useEffect(() => {
        const el = roomsWrapRef.current
        if (isStatic || !el || typeof ResizeObserver === "undefined") return
        let lastHeight = -1
        const ro = new ResizeObserver((entries) => {
            const h = Math.round(entries[0].contentRect.height)
            if (h === lastHeight) return
            lastHeight = h
            const t = pendingRef.current
            if (!t) return
            if (performance.now() > t.until) {
                pendingRef.current = null
                return
            }
            roomRefs.current[t.i]?.scrollIntoView({ behavior: reduceRef.current ? "auto" : "smooth", block: "start" })
        })
        ro.observe(el)
        const cancel = () => {
            pendingRef.current = null
        }
        window.addEventListener("wheel", cancel, { passive: true })
        window.addEventListener("touchstart", cancel, { passive: true })
        window.addEventListener("keydown", cancel)
        window.addEventListener("pointerdown", cancel)
        return () => {
            ro.disconnect()
            window.removeEventListener("wheel", cancel)
            window.removeEventListener("touchstart", cancel)
            window.removeEventListener("keydown", cancel)
            window.removeEventListener("pointerdown", cancel)
        }
    }, [isStatic, rooms.length > 0])

    // Onderblad: Esc sluit, focus naar Close en terug naar de knop
    useEffect(() => {
        if (!sheetOpen) return
        closeRef.current?.focus()
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeSheet()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [sheetOpen])

    useEffect(() => {
        if (!phone && sheetOpen) setSheetOpen(false)
    }, [phone])

    function closeSheet() {
        setSheetOpen(false)
        openRef.current?.focus({ preventScroll: true })
    }

    function onPlanLoad(index: number, img: HTMLImageElement) {
        if (!img.naturalWidth || !img.naturalHeight) return
        const next = { w: img.naturalWidth, h: img.naturalHeight }
        setNatural((prev) => (prev[index]?.w === next.w && prev[index]?.h === next.h ? prev : { ...prev, [index]: next }))
    }

    function go(i: number) {
        const el = roomRefs.current[i]
        if (!el) return
        pendingRef.current = { i, until: performance.now() + 3000 }
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    }

    if (!rooms.length) return null

    const active = Math.min(view.active, rooms.length - 1)
    const current = rooms[active]
    const currentFloor = floors.find((f) => f.index === current.floor) ?? floors[0]
    const summary = `${cap(WORDS[rooms.length] ?? String(rooms.length))} ${plural(rooms.length, "room")} · ${
        WORDS[floors.length] ?? floors.length
    } ${plural(floors.length, "floor")}`

    const panelStyle: CSSProperties = phone
        ? {
              position: "sticky",
              top: 0,
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: `10px ${gutter}px`,
              background: C.champagne,
              borderBottom: `1px solid ${C.goldLine}`,
          }
        : {
              position: "sticky",
              top: 0,
              alignSelf: "start",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              padding: `32px ${Math.round(gutter * 0.6)}px 32px ${gutter}px`,
              background: C.champagne,
              borderRight: `1px solid ${C.goldLine}`,
              boxSizing: "border-box",
          }

    const roomPad = phone ? `28px ${gutter}px 40px` : width !== null && width < 1200 ? `56px ${gutter}px 64px` : `88px ${gutter}px 88px 72px`

    return (
        <section
            ref={rootRef}
            className={phone ? "gt gt-phone" : "gt"}
            aria-label="The tour"
            style={{
                ...props.style,
                position: "relative",
                width: "100%",
                height: "auto",
                background: C.ivory,
                color: C.ink,
                borderTop: `1px solid ${C.goldLine}`,
                boxSizing: "border-box",
            }}
        >
            <style>{CSS}</style>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: phone ? "minmax(0, 1fr)" : "minmax(300px, 0.85fr) minmax(0, 1.4fr)",
                }}
            >
                <aside ref={panelRef} aria-label="Floor plan" style={panelStyle}>
                    <div
                        ref={stageRef}
                        style={phone ? { position: "relative", width: "100%", height: 150, overflow: "hidden" } : { position: "relative", flex: 1, minHeight: 0 }}
                    >
                        {floors.map((floor) => {
                            const nat = natural[floor.index] ?? { w: 368, h: 672 }
                            // Telefoon: plattegrond + stippen liggen samen in één laag die 90° tegen de klok in draait
                            const s = !stage.w || !stage.h ? 0 : phone ? Math.min(stage.w / nat.h, stage.h / nat.w) * zoom : Math.min(stage.w / nat.w, stage.h / nat.h)
                            const bw = nat.w * s
                            const bh = nat.h * s
                            // Telefoon: na draaien ligt een punt (u, v) vanaf het midden op (v, -u); schuif zo nodig zodat alle stippen van deze verdieping in het vak blijven
                            let dx = 0
                            let dy = 0
                            if (phone && s) {
                                const m = 14
                                const sx = floor.rooms.map((i) => (rooms[i].y / 100 - 0.5) * bh)
                                const sy = floor.rooms.map((i) => -(rooms[i].x / 100 - 0.5) * bw)
                                const fit = (lo: number, hi: number, half: number) =>
                                    hi - lo > 2 * (half - m) ? -(lo + hi) / 2 : Math.max(-half + m - lo, Math.min(0, half - m - hi))
                                dx = fit(Math.min(...sx), Math.max(...sx), stage.w / 2)
                                dy = fit(Math.min(...sy), Math.max(...sy), stage.h / 2)
                            }
                            const on = floor.index === currentFloor.index
                            const pos =
                                (on ? { x: current.x, y: current.y } : view.floorPos[floor.index]) ??
                                { x: rooms[floor.rooms[0]].x, y: rooms[floor.rooms[0]].y }
                            if (phone) {
                                const layer: CSSProperties = {
                                    position: "absolute",
                                    top: (stage.h - bh) / 2,
                                    left: (stage.w - bw) / 2,
                                    width: bw,
                                    height: bh,
                                    transform: `translate(${dx}px, ${dy}px) rotate(-90deg)`,
                                    opacity: on ? 1 : 0,
                                    visibility: on ? "visible" : "hidden",
                                }
                                return (
                                    <div key={floor.index} aria-hidden={!on}>
                                        <div className={on ? "gt-floor gt-on" : "gt-floor"} style={{ ...layer, mixBlendMode: "darken" }}>
                                            {hasImage(floor.plan) && (
                                                <img
                                                    src={floor.plan!.src}
                                                    alt={floor.plan!.alt || `${floor.name} plan`}
                                                    draggable={false}
                                                    onLoad={(e) => onPlanLoad(floor.index, e.currentTarget)}
                                                    style={{ display: "block", width: "100%", height: "100%", userSelect: "none" }}
                                                />
                                            )}
                                        </div>
                                        <div className={on ? "gt-floor gt-on" : "gt-floor"} style={layer}>
                                            {floor.rooms.map((i) => (
                                                <span key={i} className="gt-mk" aria-hidden style={{ left: `${rooms[i].x}%`, top: `${rooms[i].y}%` }} />
                                            ))}
                                            <span
                                                key={on ? `a${view.visit}` : "i"}
                                                className="gt-here"
                                                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            }
                            return (
                                <div
                                    key={floor.index}
                                    className={on ? "gt-floor gt-on" : "gt-floor"}
                                    aria-hidden={!on}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: (stage.w - bw) / 2,
                                        width: bw,
                                        height: bh,
                                        opacity: on ? 1 : 0,
                                        visibility: on ? "visible" : "hidden",
                                    }}
                                >
                                    {hasImage(floor.plan) && (
                                        <img
                                            src={floor.plan!.src}
                                            alt={floor.plan!.alt || `${floor.name} plan`}
                                            draggable={false}
                                            onLoad={(e) => onPlanLoad(floor.index, e.currentTarget)}
                                            style={{ display: "block", width: "100%", height: "100%", userSelect: "none" }}
                                        />
                                    )}
                                    {floor.rooms.map((i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className="gt-mk"
                                            aria-label={`Go to ${rooms[i].name}`}
                                            tabIndex={on ? 0 : -1}
                                            onClick={() => go(i)}
                                            style={{ left: `${rooms[i].x}%`, top: `${rooms[i].y}%` }}
                                        />
                                    ))}
                                    <span
                                        key={on ? `a${view.visit}` : "i"}
                                        className="gt-here"
                                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                    />
                                </div>
                            )
                        })}
                        {phone && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 6,
                                    right: 4,
                                    zIndex: 2,
                                    padding: "2px 4px",
                                    background: C.champagne,
                                    fontFamily: DISPLAY,
                                    fontWeight: 300,
                                    fontSize: 11,
                                    lineHeight: 1,
                                    letterSpacing: "0.12em",
                                    color: C.taupe,
                                    fontVariantNumeric: "tabular-nums",
                                    whiteSpace: "nowrap",
                                    pointerEvents: "none",
                                }}
                            >
                                <b style={{ color: C.ink, fontWeight: 300 }}>{pad(active + 1)}</b> / {pad(rooms.length)}
                            </div>
                        )}
                    </div>

                    {phone ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                            <div ref={captionRef} style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>
                                {/* Meetregel: past "verdieping · kamer" niet op één regel, dan valt de verdieping weg */}
                                <span
                                    ref={captionMeasureRef}
                                    aria-hidden
                                    style={{ ...caption, position: "absolute", visibility: "hidden", whiteSpace: "nowrap", pointerEvents: "none" }}
                                >
                                    {currentFloor.name} · {current.name}
                                </span>
                                <div style={caption}>
                                    {showFloor && <span style={{ color: C.taupe }}>{currentFloor.name} · </span>}
                                    <span style={{ color: C.ink }}>{current.name}</span>
                                </div>
                            </div>
                            <button
                                ref={openRef}
                                type="button"
                                className="gt-btn"
                                aria-haspopup="dialog"
                                aria-expanded={sheetOpen}
                                onClick={() => setSheetOpen(true)}
                                style={{ height: 32, padding: "0 12px", boxSizing: "border-box" }}
                            >
                                Rooms
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                            <div
                                style={{
                                    fontFamily: DISPLAY,
                                    fontWeight: 300,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.14em",
                                    fontSize: 17,
                                }}
                            >
                                {currentFloor.name}
                            </div>
                            <div
                                style={{
                                    fontFamily: DISPLAY,
                                    fontWeight: 300,
                                    fontSize: 13,
                                    letterSpacing: "0.12em",
                                    color: C.taupe,
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                <b style={{ color: C.ink, fontWeight: 300 }}>{pad(active + 1)}</b> / {pad(rooms.length)}
                            </div>
                        </div>
                    )}
                    {phone ? null : (
                        <div style={{ display: "flex", flexDirection: "column-reverse", borderTop: `1px solid ${C.goldLine}` }}>
                            {floors.map((floor) => (
                                <button
                                    key={floor.index}
                                    type="button"
                                    className={floor.index === currentFloor.index ? "gt-floorbtn gt-on" : "gt-floorbtn"}
                                    aria-current={floor.index === currentFloor.index ? "location" : undefined}
                                    onClick={() => go(floor.rooms[0])}
                                >
                                    <span className="gt-fname">{floor.name}</span>
                                    <span style={{ fontSize: 11, letterSpacing: "0.1em" }}>
                                        {floor.rooms.length} {plural(floor.rooms.length, "room")}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                <div ref={roomsWrapRef} style={{ minWidth: 0 }}>
                    {rooms.map((room, i) => (
                        <article
                            key={i}
                            ref={(el) => {
                                roomRefs.current[i] = el
                            }}
                            style={{
                                padding: roomPad,
                                borderBottom: i < rooms.length - 1 ? `1px solid ${C.goldLine}` : undefined,
                                scrollMarginTop: phone ? panelHeight : 0,
                                display: "grid",
                                gap: 22,
                            }}
                        >
                            {hasImage(room.image) && (
                                <figure style={{ margin: 0, background: C.champagne }}>
                                    <img
                                        src={room.image!.src}
                                        srcSet={room.image!.srcSet}
                                        sizes={phone ? "100vw" : "60vw"}
                                        alt={room.image!.alt || room.name}
                                        loading={i < 2 ? "eager" : "lazy"}
                                        style={{ display: "block", width: "100%", height: "auto", maxHeight: "78vh", objectFit: "cover" }}
                                    />
                                </figure>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    flexWrap: phone ? "wrap" : "nowrap",
                                    gap: phone ? "6px 14px" : 18,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: DISPLAY,
                                        fontWeight: 300,
                                        fontSize: 13,
                                        letterSpacing: "0.14em",
                                        color: C.gold,
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {pad(i + 1)}
                                </span>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontFamily: DISPLAY,
                                        fontWeight: 300,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.14em",
                                        fontSize: phone ? 20 : width !== null && width < 1200 ? 22 : 26,
                                        lineHeight: 1.2,
                                        color: C.ink,
                                    }}
                                >
                                    {room.name}
                                </h3>
                                <span style={{ ...label, ...(phone ? { width: "100%", order: 3 } : { marginLeft: "auto" }) }}>
                                    {floors.find((f) => f.index === room.floor)?.name}
                                </span>
                            </div>
                            {room.text && (
                                <p
                                    style={{
                                        margin: 0,
                                        fontFamily: BODY,
                                        fontWeight: 400,
                                        fontSize: phone ? 16 : 17,
                                        lineHeight: 1.6,
                                        maxWidth: "58ch",
                                        whiteSpace: "pre-line",
                                        color: C.ink,
                                    }}
                                >
                                    {room.text}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            </div>

            {sheetOpen &&
                phone &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeSheet()
                        }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 100,
                            background: `color-mix(in srgb, ${C.ink} 35%, transparent)`,
                            display: "flex",
                            alignItems: "flex-end",
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Rooms"
                            style={{
                                background: C.ivory,
                                color: C.ink,
                                width: "100%",
                                maxHeight: "82vh",
                                overflow: "auto",
                                padding: "22px 24px calc(22px + env(safe-area-inset-bottom, 0px))",
                                borderTop: `1px solid ${C.goldLine}`,
                                boxSizing: "border-box",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={label}>{summary}</span>
                                <button ref={closeRef} type="button" className="gt-x" onClick={closeSheet}>
                                    Close
                                </button>
                            </div>
                            {floors
                                .slice()
                                .reverse()
                                .map((floor) => (
                                    <div key={floor.index}>
                                        <h4 style={{ ...label, margin: "18px 0 4px" }}>{floor.name}</h4>
                                        {floor.rooms.map((i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                className={i === active ? "gt-pick gt-on" : "gt-pick"}
                                                aria-current={i === active ? "true" : undefined}
                                                onClick={() => {
                                                    setSheetOpen(false)
                                                    go(i)
                                                }}
                                            >
                                                <span>{pad(i + 1)}</span>
                                                {rooms[i].name}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                        </div>
                    </div>,
                    document.body
                )}
        </section>
    )
}

// 70 vaste velden: Floor 1–5 (Name, Plan) en Room 1–10 (Name, Image, Text, Floor, Plan X, Plan Y)
const controls: Record<string, any> = {}
for (let f = 1; f <= FLOOR_COUNT; f++) {
    controls[`floor${f}Name`] = { type: ControlType.String, title: `Floor ${f} Name`, defaultValue: "" }
    controls[`floor${f}Plan`] = { type: ControlType.ResponsiveImage, title: `Floor ${f} Plan` }
}
for (let r = 1; r <= ROOM_COUNT; r++) {
    controls[`room${r}Name`] = { type: ControlType.String, title: `Room ${r} Name`, defaultValue: "" }
    controls[`room${r}Image`] = { type: ControlType.ResponsiveImage, title: `Room ${r} Image` }
    controls[`room${r}Text`] = { type: ControlType.String, title: `Room ${r} Text`, defaultValue: "", displayTextArea: true }
    controls[`room${r}Floor`] = {
        type: ControlType.Number,
        title: `Room ${r} Floor`,
        defaultValue: 1,
        min: 1,
        max: FLOOR_COUNT,
        step: 1,
        displayStepper: true,
    }
    controls[`room${r}PlanX`] = { type: ControlType.Number, title: `Room ${r} Plan X`, defaultValue: 50, min: 0, max: 100, step: 0.1, unit: "%" }
    controls[`room${r}PlanY`] = { type: ControlType.Number, title: `Room ${r} Plan Y`, defaultValue: 50, min: 0, max: 100, step: 0.1, unit: "%" }
}
controls.phonePlanZoom = {
    type: ControlType.Number,
    title: "Phone Plan Zoom",
    defaultValue: 1.4,
    min: 1,
    max: 3,
    step: 0.05,
    description: "Enlarges the plan in the phone bar so the walls fill it; the empty margin around the plan is cut off.",
}
addPropertyControls(GarelliTour, controls)
