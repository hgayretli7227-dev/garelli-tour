# Floor plans for Lansdowne Crescent in the exact drawing style of the Phillimore Place plans
# (same elements, strokes, colours, Jost labels and margins as the approved mockup SVGs).
import json, math

INK, TAUPE, LIGHT, GOLD, BG = "#2B231D", "#7B6E62", "#B8AB9C", "#9C7A4B", "#FBF8F2"
FONT = "Jost, 'Helvetica Neue', Arial, sans-serif"
W = 368
U = 256 / 9.0  # house is 9 m wide between x=56 and x=312
X0, Y0 = 56, 56
DEPTH = 14.0


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

    def outer(self):
        self.el.append(f'<rect x="{X(0)}" y="{Y(0)}" width="{X(9)-X(0)}" height="{round(Y(DEPTH)-Y(0),2)}" fill="none" stroke="{INK}" stroke-width="5"/>')

    def wall(self, x1, y1, x2, y2):
        self.el.append(f'<line x1="{X(x1)}" y1="{Y(y1)}" x2="{X(x2)}" y2="{Y(y2)}" stroke="{INK}" stroke-width="2.5"/>')

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

    def label(self, key, name_lines, w, d, cx, cy, rotate=False):
        """Main room label (tour rooms): name in Ink 13px, dimensions in Taupe 9.5px below."""
        cxu, cyu = X(cx), Y(cy)
        d1, d2 = dims(w, d)
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


L, H = 3.6, 5.4           # party walls of the central hall (x in metres)
STAIR = (4.3, 5.4, 6.6, 11.6)
HOUSE_BOTTOM = Y(DEPTH)
UPPER_H = round(HOUSE_BOTTOM + 74 + 22)   # same spacing as Phillimore: label 74 below the house, 22 from the edge
GARDEN = (DEPTH + 0.56, DEPTH + 0.56 + 12.0)  # 16 units gap, garden 9 x 12 m
LG_H = round(Y(GARDEN[1]) + 82 + 22)

plans, rooms = {}, {}

# ---------- Lower ground ----------
p = Plan(LG_H)
p.outer()
p.wall(4.2, 0, 4.2, DEPTH)             # kitchen runs the full depth on the left
p.wall(H, 0, H, DEPTH)
p.wall(H, 4.6, 9, 4.6)
p.wall(H, 6.6, 9, 6.6)
p.window_h(0.7, 3.5, 0)                # front lightwell window
p.window_h(6.2, 8.3, 0)
p.window_h(6.0, 8.4, DEPTH)            # family room to the garden
p.stairs(*STAIR)
p.door((4.2, 1.8), (4.2, 3.0), (1, 0))  # kitchen from the stair hall
p.door((H, 0.5), (H, 1.5), (1, 0))      # utility
p.door((H, 5.0), (H, 6.2), (1, 0))      # wc
p.door((H, 12.2), (H, 13.4), (1, 0))    # family room
# double garden doors across the back of the kitchen
p.door((0.6, DEPTH), (1.9, DEPTH), (0, 1))
p.door((3.2, DEPTH), (1.9, DEPTH), (0, 1))
p.label("kitchen", ["KITCHEN"], 4.2, 14.0, 2.1, 7.0)
p.minor("UTILITY", 7.2, 3.0)
p.minor("WC", 7.2, 5.6)
p.minor("FAMILY ROOM", 7.2, 10.3)
# garden
g0, g1 = Y(GARDEN[0]), Y(GARDEN[1])
p.el.append(f'<rect x="{X(0)}" y="{g0}" width="{X(9)-X(0)}" height="{round(g1-g0,2)}" fill="none" stroke="{TAUPE}" stroke-width="1.5" stroke-dasharray="6 4"/>')
p.el.append(f'<rect x="{X(0.45)}" y="{round(g0+12,2)}" width="{round(X(8.55)-X(0.45),2)}" height="{round(U*3.2,2)}" fill="none" stroke="{LIGHT}" stroke-width="0.8"/>')  # stone terrace
for side in (0.35, 8.65):  # clipped box along both walls
    p.el.append(f'<rect x="{round(X(side)-6,2)}" y="{round(g0+U*4.2,2)}" width="12" height="{round(U*6.4,2)}" rx="6" fill="none" stroke="{LIGHT}" stroke-width="0.8"/>')
mx, my = X(6.9), round(g0 + U * 8.6, 2)  # magnolia
p.el.append(f'<circle cx="{mx}" cy="{my}" r="30" fill="none" stroke="{LIGHT}" stroke-width="0.8"/>')
p.el.append(f'<circle cx="{mx}" cy="{my}" r="3" fill="none" stroke="{LIGHT}" stroke-width="0.8"/>')
p.el.append(p.text(mx, round(my + 44, 2), "MAGNOLIA", 8, 1.2, TAUPE, 300))
# gate to the communal garden in the rear wall
gx1, gx2, gy = X(3.9), X(5.1), g1
p.el.append(f'<line x1="{gx1}" y1="{gy}" x2="{gx2}" y2="{gy}" stroke="{BG}" stroke-width="7"/>')
r = round(gx2 - gx1, 2)
p.el.append(f'<line x1="{gx1}" y1="{gy}" x2="{gx1}" y2="{round(gy+r,2)}" stroke="{TAUPE}" stroke-width="1.2"/>')
p.el.append(f'<path d="M{gx2} {gy} A{r} {r} 0 0 1 {gx1} {round(gy+r,2)}" fill="none" stroke="{LIGHT}" stroke-width="1" stroke-dasharray="3 3"/>')
p.el.append(p.text(184, round(gy + r + 14, 2), "GATE TO COMMUNAL GARDEN", 8, 1.2, TAUPE, 300))
p.label("garden", ["GARDEN"], 9.0, 12.0, 4.5, GARDEN[0] + 6.2)
p.top("LANSDOWNE CRESCENT")
p.bottom("LOWER GROUND FLOOR")
plans[1] = p

# ---------- Ground ----------
p = Plan(UPPER_H)
p.outer()
p.wall(L, 0, L, DEPTH)
p.wall(H, 0, H, DEPTH)
p.wall(0, 8.0, L, 8.0)
p.wall(H, 6.6, 9, 6.6)
p.wall(L, 12.2, H, 12.2)
p.window_h(0.8, 2.8, 0)
p.window_h(6.2, 8.2, 0)
p.window_h(0.8, 2.8, DEPTH)
p.window_h(6.2, 8.2, DEPTH)
p.door((3.9, 0), (5.1, 0), (0, 1))      # front door
p.door((L, 1.4), (L, 2.6), (-1, 0))     # drawing room
p.door((H, 1.4), (H, 2.6), (1, 0))      # dining room
p.door((L, 8.8), (L, 10.0), (-1, 0))    # study
p.door((H, 7.4), (H, 8.6), (1, 0))      # sitting room
p.door((6.2, 6.6), (7.0, 6.6), (0, 1))  # double doors dining -> sitting room
p.door((7.8, 6.6), (7.0, 6.6), (0, 1))
p.door((3.65, 12.2), (4.45, 12.2), (0, 1))  # wc
p.stairs(*STAIR)
p.chimney_v(0, 2.8, 5.0, +1)
p.chimney_v(9, 2.2, 4.4, -1)
p.label("hall", ["ENTRANCE HALL"], 1.8, 12.2, 4.25, 3.55, rotate=True)
p.label("drawing", ["DRAWING", "ROOM"], 3.6, 8.0, 1.95, 4.0)
p.label("dining", ["DINING", "ROOM"], 3.6, 6.6, 7.25, 3.3)
p.minor("STUDY", 1.8, 11.0)
p.minor("SITTING ROOM", 7.2, 10.3)
p.minor("WC", 4.95, 13.35)
p.top("LANSDOWNE CRESCENT")
p.bottom("GROUND FLOOR")
plans[2] = p

# ---------- First ----------
p = Plan(UPPER_H)
p.outer()
p.wall(L, 0, L, DEPTH)
p.wall(H, 0, H, DEPTH)
p.wall(0, 7.8, L, 7.8)
p.wall(0, 9.6, L, 9.6)
p.wall(H, 6.8, 9, 6.8)
p.wall(H, 9.0, 9, 9.0)
p.window_h(0.6, 1.6, 0); p.window_h(2.0, 3.0, 0)   # two tall windows
p.window_h(6.2, 8.2, 0)
p.window_h(0.5, 3.1, DEPTH)                           # three-part bathroom window
p.window_h(6.2, 8.2, DEPTH)
p.window_h(4.0, 5.0, 0)                               # landing window over the front door
p.door((L, 1.4), (L, 2.6), (-1, 0))     # principal bedroom
p.door((2.4, 7.8), (3.4, 7.8), (0, 1))  # dressing
p.door((1.0, 9.6), (2.2, 9.6), (0, 1))  # bathroom
p.door((H, 1.4), (H, 2.6), (1, 0))      # bedroom 4
p.door((H, 6.9), (H, 7.9), (1, 0))      # shower room
p.door((H, 10.0), (H, 11.2), (1, 0))    # study
p.stairs(*STAIR)
p.chimney_v(0, 5.2, 7.2, +1)
p.label("principal", ["PRINCIPAL", "BEDROOM"], 3.6, 7.8, 1.95, 3.9)
p.label("bath", ["BATHROOM"], 3.6, 4.4, 1.8, 11.8)
p.minor("DRESSING", 1.2, 8.7)
p.minor("BEDROOM 4", 7.2, 3.4)
p.minor("SHOWER ROOM", 7.3, 8.55)
p.minor("STUDY", 7.2, 11.5)
p.top("FRONT")
p.bottom("FIRST FLOOR")
plans[3] = p

# ---------- Second ----------
p = Plan(UPPER_H)
p.outer()
p.wall(L, 0, L, DEPTH)
p.wall(H, 0, H, DEPTH)
p.wall(0, 7.2, L, 7.2)
p.wall(H, 6.8, 9, 6.8)
p.wall(H, 9.6, 9, 9.6)
p.window_h(0.8, 2.8, 0)
p.window_h(6.2, 8.2, 0)
p.window_h(0.8, 2.8, DEPTH)
p.window_h(6.4, 8.0, DEPTH)
p.door((L, 1.4), (L, 2.6), (-1, 0))     # bedroom
p.door((L, 8.4), (L, 9.6), (-1, 0))     # bedroom 3
p.door((H, 1.4), (H, 2.6), (1, 0))      # bedroom 5
p.door((H, 6.9), (H, 7.9), (1, 0))      # family bath
p.door((H, 10.4), (H, 11.6), (1, 0))    # shower room
p.stairs(*STAIR)
p.chimney_v(0, 4.4, 6.4, +1)
p.label("bedroom", ["BEDROOM"], 3.6, 7.2, 1.9, 3.6)
p.minor("BEDROOM 3", 1.8, 10.6)
p.minor("BEDROOM 5", 7.2, 3.4)
p.minor("FAMILY BATH", 7.3, 8.75)
p.minor("SHOWER ROOM", 7.3, 12.6)
p.top("FRONT")
p.bottom("SECOND FLOOR")
plans[4] = p

# Plan X/Y: geometric centre of each tour room (metres), like the Phillimore values
CENTRES = {"kitchen": (1, 2.1, 7.0), "garden": (1, 4.5, GARDEN[0] + 6.0), "hall": (2, 4.5, 6.3),
           "drawing": (2, 1.8, 4.0), "dining": (2, 7.2, 3.3), "principal": (3, 1.8, 3.9),
           "bath": (3, 1.8, 11.8), "bedroom": (4, 1.8, 3.6)}
for k, (f, mx_, my_) in CENTRES.items():
    plans[f].rooms[k] = (X(mx_), Y(my_))
out = {}
for f, pl in plans.items():
    open(f"ld{f}.svg", "w").write(pl.svg())
    for k, (cx, cy) in pl.rooms.items():
        out[k] = {"floor": f, "x": round(cx / W * 100, 1), "y": round(cy / pl.h * 100, 1)}
out["_sizes"] = {f: [W, pl.h] for f, pl in plans.items()}
json.dump(out, open("ld-rooms.json", "w"), indent=1)
print(json.dumps(out, indent=1))
