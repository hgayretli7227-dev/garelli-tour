# Garelli Prestige Properties — De rondleiding

Bron van de Framer-codecomponent `GarelliTour` op `/homes/:Homes` (vervangt "Tour Slot (Fable, step 8)").

- `framer/code/GarelliTour.tsx` — dezelfde code als `GarelliTour.tsx` in het Framer-project. 70 controls (Floor 1–5, Room 1–10), gebonden aan de Homes-velden.
- `test/` — lokale testomgeving (React + Playwright) met stub voor `framer`. Bundel `entry.tsx` met esbuild (`--alias:framer=./framer-stub.ts`) en een `homes.json` met CMS-waarden, serveer op `127.0.0.1:8765` en draai `node tour.test.mjs`.
