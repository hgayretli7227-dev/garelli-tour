import { chromium } from "playwright-core"
const base = "http://127.0.0.1:8765/gallery.html"
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "127.0.0.1" } : undefined
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", proxy, args: ["--ignore-certificate-errors"] })
const R = []; const ok = (n, c, x = "") => R.push(`${c ? "PASS" : "FAIL"}  ${n} ${x}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function open(vp, { reduce = false, slug = "phillimore-place", touch = false } = {}) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: reduce ? "reduce" : "no-preference", ignoreHTTPSErrors: true, hasTouch: touch, isMobile: touch })
  const p = await ctx.newPage(); p.on("pageerror", (e) => R.push("PAGEERROR " + e.message))
  await p.goto(`${base}?slug=${slug}`, { waitUntil: "networkidle" }); await sleep(300); return p
}
const meta = (p) => p.evaluate(() => [...document.querySelectorAll(".gg-meta span")].map((s) => s.textContent).join(" | "))
const OUT = "../screenshots/gallery/"
// Desktop
{
  const p = await open({ width: 1440, height: 900 })
  const g = await p.evaluate(() => { const t = [...document.querySelectorAll(".gg-tile")]; const cs = getComputedStyle(document.querySelector(".gg-grid"));
    return { n: t.length, cols: cs.gridTemplateColumns.split(" ").length, gap: cs.columnGap, first: t[0].getAttribute("aria-label"), second: t[1].getAttribute("aria-label"),
      ratio: (t[0].getBoundingClientRect().width / t[0].getBoundingClientRect().height).toFixed(2), fit: getComputedStyle(t[0].querySelector("img")).objectFit, lazy: t[0].querySelector("img").loading, srcset: !!t[0].querySelector("img").srcset } })
  ok("D: 11 tiles, 4 cols, gap 8px, 3:2 cover, lazy+srcset", g.n === 11 && g.cols === 4 && g.gap === "8px" && g.ratio === "1.50" && g.fit === "cover" && g.lazy === "lazy" && g.srcset, JSON.stringify(g))
  ok("D: aria labels", g.first === "Open photograph: Front" && g.second === "Open photograph: Entrance Hall", g.first + " / " + g.second)
  await p.locator("#photos").scrollIntoViewIfNeeded(); await p.evaluate(() => scrollTo(0, document.querySelector("#photos").offsetTop - 20)); await sleep(1500)
  await p.hover(".gg-tile >> nth=2"); await sleep(400)
  const hov = await p.evaluate(() => { const i = document.querySelectorAll(".gg-tile img")[2]; return { f: getComputedStyle(i).filter, t: getComputedStyle(i).transform } })
  ok("D: hover = brightness only, no scale", hov.f.includes("brightness") && hov.t === "none", JSON.stringify(hov))
  await p.mouse.move(5, 5); await sleep(400)
  
  await p.click(".gg-tile >> nth=2"); await sleep(400)
  const st = await p.evaluate(() => { const b = document.querySelector(".gg-box"); const img = document.querySelector(".gg-stage img:last-of-type");
    return { parent: b.parentElement === document.body, pos: getComputedStyle(b).position, bg: getComputedStyle(b).backgroundColor, focus: document.activeElement?.getAttribute("aria-label"), lock: getComputedStyle(document.body).overflow + "/" + getComputedStyle(document.documentElement).overflow, fit: getComputedStyle(img).objectFit, maxH: getComputedStyle(img).maxHeight, h: img.getBoundingClientRect().height,
      cap: getComputedStyle(document.querySelector(".gg-meta")), } })
  const capS = await p.evaluate(() => { const c = getComputedStyle(document.querySelector(".gg-meta")); return [c.fontFamily.split(",")[0], c.textTransform, c.letterSpacing, c.color].join(" ") })
  ok("D: lightbox portal on body, fixed, Ivory bg", st.parent && st.pos === "fixed" && st.bg === "rgb(251, 248, 242)", st.bg)
  ok("D: focus on close, body scroll locked", st.focus === "Close" && st.lock === "hidden/hidden", st.focus + " " + st.lock)
  ok("D: contain, max 88vh", st.fit === "contain" && st.maxH === "792px" && st.h <= 792, `${st.maxH} h=${st.h}`)
  ok("D: caption Jost uppercase .2em Taupe", capS.includes("Jost") && capS.includes("uppercase") && capS.includes("2.2px") && capS.includes("rgb(123, 110, 98)"), capS)
  ok("D: counter 03 / 11", (await meta(p)) === "Dining Room | 03 / 11", await meta(p))
  await sleep(300); await p.screenshot({ path: OUT + "phillimore-lightbox-desktop.png" })
  await p.keyboard.press("ArrowRight"); await sleep(50)
  const fade = await p.evaluate(() => ({ out: !!document.querySelector(".gg-out"), dur: getComputedStyle(document.querySelector(".gg-in")).animationDuration }))
  ok("D: crossfade 250ms", fade.out && fade.dur === "0.25s", JSON.stringify(fade))
  await sleep(350); ok("D: ArrowRight -> 04", (await meta(p)) === "Kitchen | 04 / 11", await meta(p))
  await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft"); await sleep(350)
  ok("D: ArrowLeft wraps 01 -> 11", (await meta(p)) === "Study | 11 / 11", await meta(p))
  await p.click(".gg-next"); await sleep(350); ok("D: next button", (await meta(p)) === "Front | 01 / 11", await meta(p))
  await p.keyboard.press("Escape"); await sleep(200)
  const cl = await p.evaluate(() => ({ box: !!document.querySelector(".gg-box"), focus: document.activeElement?.getAttribute("aria-label"), lock: document.body.style.overflow }))
  ok("D: Esc closes, focus back on clicked tile, scroll free", !cl.box && cl.focus === "Open photograph: Dining Room" && cl.lock === "", JSON.stringify(cl))
  const arrows = await p.evaluate(() => null)
}
// Tablet
{
  const p = await open({ width: 1000, height: 800 })
  const c = await p.evaluate(() => getComputedStyle(document.querySelector(".gg-grid")).gridTemplateColumns.split(" ").length)
  ok("T: 3 cols", c === 3, String(c))
}
// Phone
{
  const p = await open({ width: 390, height: 844 }, { touch: true })
  const g = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector(".gg-grid")); return { cols: cs.gridTemplateColumns.split(" ").length, gap: cs.columnGap } })
  ok("P: 2 cols, gap 6px", g.cols === 2 && g.gap === "6px", JSON.stringify(g))
  await p.evaluate(() => scrollTo(0, document.querySelector("#photos").offsetTop - 10)); await sleep(1500)
  
  await p.tap(".gg-tile >> nth=2"); await sleep(400)
  const vis = await p.evaluate(() => ({ prev: getComputedStyle(document.querySelector(".gg-prev")).display, tap: getComputedStyle(document.querySelector(".gg-tap-r")).display }))
  ok("P: arrows hidden, tap zones active", vis.prev === "none" && vis.tap === "block", JSON.stringify(vis))
  await sleep(300); await p.screenshot({ path: OUT + "phillimore-lightbox-phone.png" })
  const box = await p.locator(".gg-stage").boundingBox()
  await p.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2); await sleep(350)
  ok("P: tap right -> next", (await meta(p)) === "Kitchen | 04 / 11", await meta(p))
  await p.touchscreen.tap(box.x + box.width * 0.2, box.y + box.height / 2); await sleep(350)
  ok("P: tap left -> prev", (await meta(p)) === "Dining Room | 03 / 11", await meta(p))
  const swipe = (x0, x1) => p.evaluate(([x0, x1, y]) => { const el = document.querySelector(".gg-stage")
    const t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y })
    el.dispatchEvent(new TouchEvent("touchstart", { touches: [t(x0)], changedTouches: [t(x0)], bubbles: true, cancelable: true }))
    el.dispatchEvent(new TouchEvent("touchend", { touches: [], changedTouches: [t(x1)], bubbles: true, cancelable: true })) }, [x0, x1, box.y + 50])
  await swipe(300, 100); await sleep(350); ok("P: swipe left -> next", (await meta(p)) === "Kitchen | 04 / 11", await meta(p))
  await swipe(100, 300); await sleep(350); ok("P: swipe right -> prev", (await meta(p)) === "Dining Room | 03 / 11", await meta(p))
}
// Reduced motion
{
  const p = await open({ width: 1280, height: 800 }, { reduce: true })
  await p.click(".gg-tile >> nth=0"); await p.keyboard.press("ArrowRight"); await sleep(30)
  const r = await p.evaluate(() => ({ anim: getComputedStyle(document.querySelector(".gg-stage img:last-of-type")).animationName, out: document.querySelector(".gg-out") ? getComputedStyle(document.querySelector(".gg-out")).display : "none", hover: getComputedStyle(document.querySelector(".gg-tile img")).transitionDuration }))
  ok("RM: no animation", r.anim === "none" && r.out === "none" && r.hover === "0s", JSON.stringify(r))
}
// Holland Park (Sold, no rooms)
{
  const p = await open({ width: 1280, height: 800 }, { slug: "holland-park" })
  ok("Holland Park: section absent", (await p.locator("#photos").count()) === 0)
}
console.log(R.join("\n")); await browser.close()
