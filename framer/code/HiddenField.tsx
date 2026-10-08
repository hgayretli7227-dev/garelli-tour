// Hidden Field — a native hidden <input> for Framer forms, so a CMS value (house name, agent name)
// can travel with every submission. Bind "Value" to a CMS field in the property panel.
// On the canvas it shows a small tag so editors can see it; on the site it renders nothing visible.
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function HiddenField({ name, value }: { name: string; value: string }) {
    if (RenderTarget.current() === RenderTarget.canvas) {
        return (
            <div style={{ font: "11px/1.4 Jost, sans-serif", letterSpacing: ".1em", color: "#7B6E62", border: "1px dashed #CDB48A", padding: "4px 8px", whiteSpace: "nowrap" }}>
                Hidden · {name}: {value || "—"}
            </div>
        )
    }
    return <input type="hidden" name={name} value={value ?? ""} readOnly />
}

addPropertyControls(HiddenField, {
    name: { type: ControlType.String, title: "Name", defaultValue: "House" },
    value: { type: ControlType.String, title: "Value", defaultValue: "" },
})
