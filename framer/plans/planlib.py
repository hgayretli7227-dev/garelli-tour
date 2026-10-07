# Floor plans for Lansdowne Crescent in the exact drawing style of the Phillimore Place plans
# (same elements, strokes, colours, Jost labels and margins as the approved mockup SVGs).
import json, math

INK, TAUPE, LIGHT, GOLD, BG = "#2B231D", "#7B6E62", "#B8AB9C", "#9C7A4B", "#FBF8F2"
FONT = "Jost, 'Helvetica Neue', Arial, sans-serif"
W = 368
U = 256 / 9.0
X0, Y0 = 56, 56
DEPTH = 14.0


def configure(width_m, depth_m):
    """Scale so the building width spans x=56..312, exactly like the Phillimore plans."""
    global U, DEPTH
    U = 256 / float(width_m)
    DEPTH = float(depth_m)


def X(m): return round(X0 + m * U, 2)
def Y(m): return round(Y0 + m * U, 2)


def ftin(m):
    inches = round(m / 0.0254)
    return f"{inches // 12}′{inches % 12}″"


def dims(w, d):
    return f"{w:.1f} × {d:.1f} m", f"{ftin(w)} × {ftin(d)}"


class Plan:
    def __init__(self, height):
        self.h = height
        self.el = [f'<rect width="100%" height="100%" fill="{BG}"/>']
        self.rooms = {}

    def outer(self, x1=0, y1=0, x2=None, y2=None):
        x2 = (256 / U) if x2 is None else x2
        y2 = DEPTH if y2 is None else y2
        self.el.append(f'<rect x="{X(x1)}" y="{Y(y1)}" width="{round(X(x2)-X(x1),2)}" height="{round(Y(y2)-Y(y1),2)}" fill="none" stroke="{INK}" stroke-width="5"/>')

    def dashed(self, x1, y1, x2, y2):
        self.el.append(f'<rect x="{X(x1)}" y="{Y(y1)}" width="{round(X(x2)-X(x1),2)}" height="{round(Y(y2)-Y(y1),2)}" fill="none" stroke="{TAUPE}" stroke-width="1.5" stroke-dasharray="6 4"/>')

    def light_rect(self, x1, y1, x2, y2, rx=0):
        self.el.append(f'<rect x="{X(x1)}" y="{Y(y1)}" width="{round(X(x2)-X(x1),2)}" height="{round(Y(y2)-Y(y1),2)}" rx="{rx}" fill="none" stroke="{LIGHT}" stroke-width="0.8"/>')

    def light_circle(self, cx, cy, r):
        self.el.append(f'<circle cx="{X(cx)}" cy="{Y(cy)}" r="{r}" fill="none" stroke="{LIGHT}" stroke-width="0.8"/>')

    def small(self, s, cx, cy):
        self.el.append(self.text(X(cx), round(Y(cy) + 3, 2), s, 8, 1.2, TAUPE, 300))

    def lift(self, x1, y1, x2, y2):
        self.el.append(f'<rect x="{X(x1)}" y="{Y(y1)}" width="{round(X(x2)-X(x1),2)}" height="{round(Y(y2)-Y(y1),2)}" fill="{LIGHT}" fill-opacity=".35" stroke="{TAUPE}" stroke-width="1"/>')
        self.small("LIFT", (x1 + x2) / 2, (y1 + y2) / 2)

    def wall(self, x1, y1, x2, y2):
        self.el.append(f'<line x1="{X(x1)}" y1="{Y(y1)}" x2="{X(x2)}" y2="{Y(y2)}" stroke="{INK}" stroke-width="2.5"/>')

    def stairs_h(self, x1, x2, y1, y2):  # horizontal flight, rising to the right
        a, b, c, d = X(x1), X(x2), Y(y1), Y(y2)
        self.el.append(f'<rect x="{a}" y="{c}" width="{round(b-a,2)}" height="{round(d-c,2)}" fill="none" stroke="{TAUPE}" stroke-width="1"/>')
        n = round((b - a) / 10.2); step = (b - a) / n
        for i in range(1, n):
            xx = round(a + i * step, 2)
            self.el.append(f'<line x1="{xx}" y1="{c}" x2="{xx}" y2="{d}" stroke="{LIGHT}" stroke-width="0.8"/>')
        my = round((c + d) / 2, 2)
        self.el.append(f'<line x1="{a+8}" y1="{my}" x2="{b-10}" y2="{my}" stroke="{TAUPE}" stroke-width="1"/>')
        self.el.append(f'<path d="M{b-16} {my-4} L{b-8} {my} L{b-16} {my+4}" fill="none" stroke="{TAUPE}" stroke-width="1"/>')

    def window_h(self, x1, x2, y):  # window in a horizontal wall
        a, b, yy = X(x1), X(x2), Y(y)
        self.el.append(f'<line x1="{a}" y1="{yy}" x2="{b}" y2="{yy}" stroke="{BG}" stroke-width="7"/>')
        for o in (-2.5, 0, 2.5):
            self.el.append(f'<line x1="{a}" y1="{round(yy+o,2)}" x2="{b}" y2="{round(yy+o,2)}" stroke="{TAUPE}" stroke-width="1"/>')

    def window_v(self, x, y1, y2):
        xx, a, b = X(x), Y(y1), Y(y2)
        self.el.append(f'<line x1="{xx}" y1="{a}" x2="{xx}" y2="{b}" stroke="{BG}" stroke-width="7"/>')
        for o in (-2.5, 0, 2.5):
            self.el.append(f'<line x1="{round(xx+o,2)}" y1="{a}" x2="{round(xx+o,2)}" y2="{b}" stroke="{TAUPE}" stroke-width="1"/>')

    def door(self, hinge, closed, opendir):
        """hinge/closed in metres; opendir = unit vector (in plan coords) the leaf swings to."""
        hx, hy = X(hinge[0]), Y(hinge[1])
        cx, cy = X(closed[0]), Y(closed[1])
        r = round(math.hypot(cx - hx, cy - hy), 2)
        lx, ly = round(hx + opendir[0] * r, 2), round(hy + opendir[1] * r, 2)
        v1 = (cx - hx, cy - hy); v2 = (lx - hx, ly - hy)
        sweep = 1 if v1[0] * v2[1] - v1[1] * v2[0] > 0 else 0
        self.el.append(f'<line x1="{hx}" y1="{hy}" x2="{cx}" y2="{cy}" stroke="{BG}" stroke-width="7"/>')
        self.el.append(f'<line x1="{hx}" y1="{hy}" x2="{lx}" y2="{ly}" stroke="{TAUPE}" stroke-width="1.2"/>')
        self.el.append(f'<path d="M{cx} {cy} A{r} {r} 0 0 {sweep} {lx} {ly}" fill="none" stroke="{LIGHT}" stroke-width="1" stroke-dasharray="3 3"/>')

    def stairs(self, x1, x2, y1, y2, up=True):
        a, b, c, d = X(x1), X(x2), Y(y1), Y(y2)
        self.el.append(f'<rect x="{a}" y="{c}" width="{round(b-a,2)}" height="{round(d-c,2)}" fill="none" stroke="{TAUPE}" stroke-width="1"/>')
        n = round((d - c) / 10.2)
        step = (d - c) / n
        for i in range(1, n):
            yy = round(c + i * step, 2)
            self.el.append(f'<line x1="{a}" y1="{yy}" x2="{b}" y2="{yy}" stroke="{LIGHT}" stroke-width="0.8"/>')
        mx = round((a + b) / 2, 2)
        top, bot = round(c + 8, 2), round(d - 8, 2)
        self.el.append(f'<line x1="{mx}" y1="{bot}" x2="{mx}" y2="{top+2}" stroke="{TAUPE}" stroke-width="1"/>')
        self.el.append(f'<path d="M{mx-4} {top+8} L{mx} {top} L{mx+4} {top+8}" fill="none" stroke="{TAUPE}" stroke-width="1"/>')

    def chimney_v(self, x, y1, y2, inward):  # chimney breast against a vertical wall
        xx = X(x)
        w = 16
        rx = xx if inward > 0 else xx - w
        self.el.append(f'<rect x="{round(rx,2)}" y="{Y(y1)}" width="{w}" height="{round(Y(y2)-Y(y1),2)}" fill="{LIGHT}" fill-opacity=".35" stroke="{TAUPE}" stroke-width="1"/>')

    def text(self, x, y, s, size, ls, fill, weight, rotate=None):
        return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="{FONT}" font-size="{size}" letter-spacing="{ls}" fill="{fill}" font-weight="{weight}">{s}</text>'

    def label(self, key, name_lines, w, d, cx, cy, rotate=False, dims_lines=None):
        """Main room label (tour rooms): name in Ink 13px, dimensions in Taupe 9.5px below."""
        cxu, cyu = X(cx), Y(cy)
        d1, d2 = dims(w, d) if dims_lines is None else (dims_lines + [None])[:2]
        t = []
        if rotate:
            t.append(self.text(0, -2.5, name_lines[0], 13, 1.8, INK, 400))
            t.append(self.text(0, 14.5, f"{d1} · {d2}", 9.5, 0.6, TAUPE, 300))
            self.el.append(f'<g transform="translate({cxu} {cyu}) rotate(-90)">' + "".join(t) + "</g>")
        else:
            n = len(name_lines)
            ys = {1: [-9], 2: [-17, -1]}[n]
            for s, yy in zip(name_lines, ys):
                t.append(self.text(0, yy, s, 13, 1.8, INK, 400))
            base = ys[-1] + 17
            t.append(self.text(0, base, d1, 9.5, 0.6, TAUPE, 300))
            if d2:
                t.append(self.text(0, base + 13, d2, 9.5, 0.6, TAUPE, 300))
            self.el.append(f'<g transform="translate({cxu} {cyu})">' + "".join(t) + "</g>")
        self.rooms[key] = (cxu, cyu)

    def minor(self, s, cx, cy):
        self.el.append(self.text(X(cx), round(Y(cy) + 3, 2), s, 10, 1.4, TAUPE, 300))

    def top(self, s):
        self.el.append(self.text(184, 32, s, 10, 2.2, GOLD, 400))

    def bottom(self, s):
        self.el.append(self.text(184, self.h - 22, s, 11, 2.6, INK, 300))

    def svg(self):
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {self.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + "".join(self.el) + "</svg>"


