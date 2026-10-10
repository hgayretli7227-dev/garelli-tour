// Fact Row accessibility: keeps aria-expanded on each Good to know row button in step with its variant.
// Framer applies one code override to every variant of a component, so instead of two overrides this one
// looks at the row itself: the Body layer only exists in the Open variant.
import { useEffect, type ComponentType } from "react"

const BUTTON = '[data-framer-name="Row Button"]'
let observer: MutationObserver | null = null
let users = 0

function sync() {
    document.querySelectorAll<HTMLElement>(BUTTON).forEach((btn) => {
        const open = !!btn.parentElement?.querySelector(':scope > [data-framer-name="Body"]')
        const value = open ? "true" : "false"
        if (btn.getAttribute("aria-expanded") !== value) btn.setAttribute("aria-expanded", value)
    })
}

export function withAriaExpanded(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        useEffect(() => {
            if (typeof document === "undefined") return
            users++
            sync()
            if (!observer) {
                observer = new MutationObserver(() => sync())
                observer.observe(document.body, { childList: true, subtree: true })
            }
            return () => {
                users--
                if (users === 0 && observer) {
                    observer.disconnect()
                    observer = null
                }
            }
        }, [])
        return <Component {...props} aria-expanded={props["aria-expanded"] ?? "false"} />
    }
}
