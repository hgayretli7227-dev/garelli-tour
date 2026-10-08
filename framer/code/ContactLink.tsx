// Contact Link — a tel: or mailto: link whose number/address comes from the CMS.
// Framer cannot build "tel:" + a CMS text field into a normal link, so this renders the link itself,
// drawn to match the Body Link style (Newsreader 16/1.6, Ink, Gold Line underline, Dark Gold on hover).
import { addPropertyControls, ControlType } from "framer"

const INK = "var(--token-c7bc2552-cf7d-43e9-a114-200a3743f95c, #2B231D)"
const GOLD_LINE = "var(--token-4c371422-3d51-480d-adb7-60da8302532b, #CDB48A)"
const DARK_GOLD = "var(--token-7f4f9584-b23b-495c-b613-c2f968badb92, #9C7A4B)"
const CSS = `.gcl{font-family:"Newsreader","Newsreader Placeholder",Georgia,serif;font-size:16px;line-height:1.6;font-weight:400;color:${INK};text-decoration:underline;text-decoration-color:${GOLD_LINE};text-underline-offset:4px;text-decoration-thickness:1px;transition:color .3s cubic-bezier(.44,0,.56,1);overflow-wrap:anywhere}.gcl:hover{color:${DARK_GOLD}}`

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function ContactLink({ type, value }: { type: "tel" | "mailto"; value: string }) {
    const v = (value ?? "").trim()
    if (!v) return null
    const isMail = type === "mailto" || (type as string) === "Email" || v.includes("@")
    const href = isMail ? `mailto:${v}` : `tel:${v.replace(/[^\d+]/g, "")}`
    return (
        <>
            <style>{CSS}</style>
            <a className="gcl" href={href}>
                {v}
            </a>
        </>
    )
}

addPropertyControls(ContactLink, {
    type: { type: ControlType.Enum, title: "Type", options: ["tel", "mailto"], optionTitles: ["Phone", "Email"], defaultValue: "tel" },
    value: { type: ControlType.String, title: "Value", defaultValue: "+44 20 7946 0123" },
})
