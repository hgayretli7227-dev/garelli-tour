import { chromium } from "playwright-core"
const OUT = "./"
const base = "http://127.0.0.1:8765/index.html"
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "127.0.0.1" } : undefined
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", proxy, args: ["--ignore-certificate-errors"] })
const results = []
const ok = (name, cond, extra = "") => results.push(`${cond ? "PASS" : "FAIL"}  ${name} ${extra}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function page(vp, opts = {}, slug = "phillimore-place") {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: opts.reduce ? "reduce" : "no-preference", ignoreHTTPSErrors: true })
  const p = await ctx.newPage()
  p.on("pageerror", (e) => results.push("PAGEERROR " + e.message))
  await p.goto(`${base}?slug=${slug}`, { waitUntil: "networkidle" })
  await sleep(300)
  return p
}
const state = (p) => p.evaluate(() => {
  const count = document.querySelector("aside b")?.textContent
  const floor = document.querySelector("aside > div:nth-child(2) > div")?.textContent
  const on = document.querySelector(".gt-floor.gt-on")
  const here = on?.querySelector(".gt-here")
  const panel = document.querySelector("aside").getBoundingClientRect()
  return { count, floor, panelTop: Math.round(panel.top), panelH: Math.round(panel.height), dot: here && { left: here.style.left, top: here.style.top },
    onBox: on && { w: Math.round(on.getBoundingClientRect().width), h: Math.round(on.getBoundingClientRect().height) } }
})
const scrollToRoom = (p, i, frac = 0.3) => p.evaluate(([i, frac]) => {
  const a = document.querySelectorAll("article")[i]; window.scrollTo(0, window.scrollY + a.getBoundingClientRect().top - innerHeight * frac)
}, [i, frac])

// ---- Desktop
{
  const p = await page({ width: 1280, height: 800 })
  await scrollToRoom(p, 0); await sleep(100)
  let s = await state(p)
  ok("desktop: start 01, Ground Floor", s.count === "01" && s.floor === "Ground Floor", JSON.stringify(s))
  await scrollToRoom(p, 1); await sleep(100); s = await state(p)
  ok("desktop: room 2 active, panel sticky at top, 100vh", s.count === "02" && s.panelTop === 0 && s.panelH === 800, JSON.stringify(s))
  const tr = await p.evaluate(() => getComputedStyle(document.querySelector(".gt-floor.gt-on .gt-here")).transitionDuration)
  ok("desktop: dot glides 0.7s", tr.startsWith("0.7s"), tr)
  await sleep(800)
  await p.screenshot({ path: OUT + "h-desktop-room2.png" })
  await scrollToRoom(p, 2); await sleep(100); s = await state(p)
  ok("desktop: floor switch to Lower Ground (368x992 ratio)", s.count === "03" && s.floor === "Lower Ground Floor" && Math.abs(s.onBox.w / s.onBox.h - 368 / 992) < 0.01, JSON.stringify(s))
  const fade = await p.evaluate(() => getComputedStyle(document.querySelector(".gt-floor.gt-on")).transitionDuration)
  ok("desktop: plan crossfade 0.5s", fade.startsWith("0.5s"), fade)
  const ring = await p.evaluate(() => getComputedStyle(document.querySelector(".gt-floor.gt-on .gt-here"), "::after").animationName)
  ok("desktop: pulse ring", ring === "gt-ring", ring)
  // Active line at 45%: room 4 top at 46% -> still 03; at 44% -> 04
  await scrollToRoom(p, 3, 0.46); await sleep(80); const a = (await state(p)).count
  await scrollToRoom(p, 3, 0.44); await sleep(80); const b = (await state(p)).count
  ok("desktop: 45% line", a === "03" && b === "04", `${a} ${b}`)
  // floor list click
  await p.click(".gt-floorbtn:has-text('First Floor')"); await sleep(1500); s = await state(p)
  ok("desktop: floor list click -> Drawing Room 05", s.count === "05" && s.floor === "First Floor", JSON.stringify(s))
  // marker click (library)
  await p.click(".gt-floor.gt-on .gt-mk[aria-label='Go to Library']"); await sleep(1500); s = await state(p)
  ok("desktop: marker click -> Library 06", s.count === "06", JSON.stringify(s))
  const smooth = await p.evaluate(() => getComputedStyle(document.querySelector(".gt-floor.gt-on .gt-here")).transitionDuration)
  // floors list order: bottom = lower ground
  const order = await p.$$eval(".gt-floorbtn .gt-fname", (els) => els.map((e) => [e.textContent, Math.round(e.getBoundingClientRect().top)]))
  ok("desktop: lower ground at bottom of list", order[0][0] === "Lower Ground Floor" && order[0][1] > order[4][1], JSON.stringify(order))
  // nothing blocks clicks after the component
  await p.mouse.wheel(0, 200); await sleep(800)
  await p.evaluate(() => document.getElementById("afterlink").scrollIntoView({ block: "center" })); await sleep(1500)
  await p.evaluate(() => document.getElementById("afterlink").scrollIntoView({ block: "center" })); await sleep(300)
  const hit = await p.evaluate(() => { const r = document.getElementById("afterlink").getBoundingClientRect(); const e = document.elementFromPoint(r.x + 5, r.y + 5); return e?.id || (e?.tagName + " " + e?.className + " " + JSON.stringify(r) + " y=" + scrollY) })
  ok("desktop: page below stays clickable", hit === "afterlink", hit)
  const portal = await p.evaluate(() => document.body.children.length)
  ok("desktop: no overlay in body", portal === 2, String(portal))
  await p.context().close()
}
// ---- Tablet
{
  const p = await page({ width: 1000, height: 768 })
  await scrollToRoom(p, 1); await sleep(100)
  const s = await state(p)
  const cols = await p.evaluate(() => getComputedStyle(document.querySelector(".gt > div")).gridTemplateColumns)
  const pad = await p.evaluate(() => getComputedStyle(document.querySelector("article")).paddingRight)
  ok("tablet: two columns, sticky, gutter 40", cols.split(" ").length === 2 && s.panelTop === 0 && pad === "40px", `${cols} ${pad} ${JSON.stringify(s)}`)
  await p.screenshot({ path: OUT + "h-tablet.png" })
  await p.context().close()
}
// ---- Phone
{
  const p = await page({ width: 390, height: 844 })
  await scrollToRoom(p, 1); await sleep(100)
  let s = await state(p)
  const pe = await p.evaluate(() => getComputedStyle(document.querySelector(".gt-mk")).pointerEvents)
  const stageW = await p.evaluate(() => Math.round(document.querySelector("aside > div").getBoundingClientRect().width))
  ok("phone: sticky bar at top, room 02, 64px plan, markers not clickable", s.panelTop === 0 && s.count === "02" && stageW === 64 && pe === "none", `${JSON.stringify(s)} ${stageW} ${pe}`)
  const pad = await p.evaluate(() => getComputedStyle(document.querySelector("article")).paddingLeft)
  ok("phone: gutter 24", pad === "24px", pad)
  await p.click("button.gt-btn"); await sleep(200)
  const sheet = await p.evaluate(() => { const d = document.querySelector("[role=dialog]"); return d && { inBody: d.parentElement.parentElement === document.body, label: d.querySelector("span").textContent, h: Math.round(d.getBoundingClientRect().height), groups: [...d.querySelectorAll("h4")].map(h => h.textContent), focus: document.activeElement?.textContent } })
  ok("phone: sheet in body portal, label, groups top-down, focus Close", sheet && sheet.inBody && sheet.label === "Ten rooms · five floors" && sheet.groups[0] === "Third Floor" && sheet.groups[4] === "Lower Ground Floor" && sheet.h <= 844 * 0.82 + 1 && sheet.focus === "Close", JSON.stringify(sheet))
  await p.screenshot({ path: OUT + "h-phone-sheet.png" })
  await p.click(".gt-pick:has-text('Study')"); await sleep(1500); s = await state(p)
  const open = await p.$("[role=dialog]")
  ok("phone: tap room closes sheet and jumps (Study 10)", !open && s.count === "10" && s.floor === "Third Floor", JSON.stringify(s))
  const studyTop = await p.evaluate(() => Math.round(document.querySelectorAll("article")[9].getBoundingClientRect().top))
  ok("phone: room lands right below bar", Math.abs(studyTop - s.panelH) <= 2, `${studyTop} vs ${s.panelH}`)
  await p.click("button.gt-btn"); await sleep(100); await p.keyboard.press("Escape"); await sleep(100)
  ok("phone: Esc closes", !(await p.$("[role=dialog]")))
  await p.click("button.gt-btn"); await sleep(100); await p.mouse.click(195, 30); await sleep(100)
  ok("phone: backdrop tap closes", !(await p.$("[role=dialog]")))
  await p.click("button.gt-btn"); await sleep(100); await p.click(".gt-x"); await sleep(100)
  ok("phone: Close closes", !(await p.$("[role=dialog]")))
  await scrollToRoom(p, 4); await sleep(150)
  await p.screenshot({ path: OUT + "h-phone-bar.png" })
  await p.context().close()
}
// ---- Reduced motion
{
  const p = await page({ width: 1280, height: 800 }, { reduce: true })
  await scrollToRoom(p, 0); await sleep(100)
  const st = await p.evaluate(() => { const h = document.querySelector(".gt-floor.gt-on .gt-here"); return { t: getComputedStyle(h).transitionDuration, a: getComputedStyle(h, "::after").animationName, f: getComputedStyle(document.querySelector(".gt-floor.gt-on")).transitionDuration } })
  ok("reduced: no glide/fade/ring", st.t === "0s" && st.a === "none" && st.f === "0s", JSON.stringify(st))
  const y0 = await p.evaluate(() => scrollY)
  await p.click(".gt-floorbtn:has-text('Third Floor')")
  const y1 = await p.evaluate(() => scrollY); await sleep(1500); const s = await state(p)
  ok("reduced: jump without smooth scroll", y1 - y0 > 2000 && s.count === "09", `${y0} -> ${y1} ${s.count}`)
  await p.context().close()
}
// ---- Empty home
{
  const p = await page({ width: 1280, height: 800 }, {}, "lansdowne-crescent")
  ok("lansdowne-crescent: renders nothing", !(await p.$("section.gt")))
  await p.context().close()
}
await browser.close()
console.log(results.join("\n"))
