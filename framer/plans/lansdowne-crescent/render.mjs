import { chromium } from "playwright-core"
import fs from "fs"
// usage: node render.mjs in1.svg out1.png [in2.svg out2.png ...]
const args = process.argv.slice(2)
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", proxy: { server: process.env.HTTPS_PROXY }, args: ["--ignore-certificate-errors"] })
const ctx = await b.newContext({ deviceScaleFactor: 2, ignoreHTTPSErrors: true })
const p = await ctx.newPage()
for (let i = 0; i < args.length; i += 2) {
  const svg = fs.readFileSync(args[i], "utf8")
  const w = +svg.match(/viewBox="0 0 (\d+) (\d+)"/)[1], h = +svg.match(/viewBox="0 0 (\d+) (\d+)"/)[2]
  await p.setViewportSize({ width: w, height: h })
  await p.setContent(`<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=block"><style>html,body{margin:0;background:#FBF8F2}svg{display:block;width:${w}px;height:${h}px}</style></head><body>${svg.replace(/<svg /, `<svg width="${w}" height="${h}" `)}</body></html>`, { waitUntil: "networkidle" })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(150)
  await p.screenshot({ path: args[i + 1], clip: { x: 0, y: 0, width: w, height: h } })
}
await b.close()
