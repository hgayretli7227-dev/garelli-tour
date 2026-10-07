import { createRoot } from "react-dom/client"
import GarelliTour from "./GarelliTour"
import data from "./homes.json"
const slug = new URLSearchParams(location.search).get("slug") || "phillimore-place"
const props = { ...(data as any)[slug] }
if (new URLSearchParams(location.search).get("long")) props.room7Name = "Principal Bedroom Suite with Dressing Room and Balcony"
function Page() {
  return (
    <div style={{ overflow: "clip", background: "#FBF8F2" }}>
      <div id="hero" style={{ height: 1200, background: "#eee" }}>HERO</div>
      <div id="intro" style={{ height: 300 }}>The tour</div>
      <GarelliTour {...props} />
      <div id="after" style={{ height: 1500, background: "#ddd" }}><a id="afterlink" href="#x">link after</a></div>
    </div>
  )
}
createRoot(document.getElementById("root")!).render(<Page />)
