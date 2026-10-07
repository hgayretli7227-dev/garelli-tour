export const ControlType = new Proxy({}, { get: (_t, k) => String(k).toLowerCase() }) as any
export function addPropertyControls() {}
export function useIsStaticRenderer() { return false }
