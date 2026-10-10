import { createRoot } from "react-dom/client"
import GarelliGallery from "../framer/code/GarelliGallery"
import data from "./gallery-homes.json"
const slug = new URLSearchParams(location.search).get("slug") || "phillimore-place"
const props = (data as any)[slug]
const visible = !!props.room1Image
function Page() {
  return (
    <div style={{ background: "#FBF8F2", color: "#2B231D" }}>
      <div id="before" style={{ height: 400, background: "#eee" }}>Tour</div>
      {visible && (
        <section id="photos" className="sec">
          <p className="lbl">THE PHOTOGRAPHS</p>
          <h2>Every room, in daylight</h2>
          <GarelliGallery {...props} />
        </section>
      )}
      <div id="after" style={{ padding: "120px 64px", height: 600 }}><h2>The location</h2></div>
    </div>
  )
}
createRoot(document.getElementById("root")!).render(<Page />)
