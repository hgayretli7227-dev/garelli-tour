# Eaton Mews North: mews house, 6 x 9 m, ground + two floors + roof terrace, drawn in the Phillimore plan style.
# A straight stair runs across the middle of the house under a glazed roof; carriage doors open onto the kitchen.
import json
import planlib as P
from planlib import Plan, X, Y, TAUPE, LIGHT

P.configure(6.0, 9.0)
H = round(Y(9.0) + 74 + 22)
SY1, SY2 = 4.4, 5.4          # stair band
SX1, SX2 = 0.3, 3.9          # flight; landing beside it
plans = {}


def middle(p):
    p.wall(0, SY1, 4.0, SY1); p.wall(0, SY2, 6.0, SY2)
    p.stairs_h(SX1, SX2, SY1 + 0.1, SY2 - 0.1)


# ---------- Ground floor ----------
p = Plan(H)
p.outer()
p.wall(0, SY1, 1.2, SY1); p.wall(0, SY2, 1.2, SY2)          # open plan: short nibs only
p.stairs_h(SX1, SX2, SY1 + 0.1, SY2 - 0.1)
p.wall(4.6, SY1, 6, SY1); p.wall(4.6, SY1, 4.6, SY2); p.wall(4.6, SY2, 6, SY2)
p.door((1.5, 0), (3.0, 0), (0, 1)); p.door((4.5, 0), (3.0, 0), (0, 1))   # carriage doors
p.door((4.6, 4.5), (4.6, 5.3), (-1, 0))      # wc
p.window_h(1.0, 2.6, 9); p.window_h(3.4, 5.0, 9)
p.window_h(0.3, 1.2, 0); p.window_h(4.8, 5.7, 0)
p.label("kitchen", ["KITCHEN"], 6.0, 4.4, 3.0, 2.9)
p.label("dining", ["DINING", "ROOM"], 6.0, 3.6, 3.0, 7.2)
p.minor("WC", 5.3, 4.9)
p.top("EATON MEWS NORTH")
p.bottom("GROUND FLOOR")
plans[1] = p

# ---------- First floor ----------
p = Plan(H)
p.outer()
middle(p)
p.wall(4.0, SY1, 6, SY1); p.wall(3.4, SY2, 3.4, 9)
p.window_h(0.6, 2.6, 0); p.window_h(3.4, 5.4, 0)
p.window_h(0.8, 2.6, 9); p.window_h(4.2, 5.2, 9)
p.door((4.2, SY1), (5.2, SY1), (0, -1))      # living room
p.door((2.4, SY2), (3.2, SY2), (0, 1))       # bedroom
p.door((4.4, SY2), (5.2, SY2), (0, 1))       # shower room
p.label("living", ["LIVING ROOM"], 6.0, 4.4, 3.0, 2.3)
p.label("bedroom", ["BEDROOM"], 3.4, 3.6, 1.7, 7.2)
p.minor("SHOWER", 4.7, 7.0); p.minor("ROOM", 4.7, 7.45)
p.top("FRONT")
p.bottom("FIRST FLOOR")
plans[2] = p

# ---------- Second floor ----------
p = Plan(H)
p.outer()
middle(p)
p.wall(4.0, SY1, 6, SY1); p.wall(3.0, SY2, 3.0, 9)
p.window_h(0.6, 2.6, 0); p.window_h(3.4, 5.4, 0)
p.window_h(0.6, 2.2, 9); p.window_h(3.8, 5.2, 9)
p.door((4.2, SY1), (5.2, SY1), (0, -1))      # principal bedroom
p.door((2.0, SY2), (2.8, SY2), (0, 1))       # principal bath
p.door((4.4, SY2), (5.2, SY2), (0, 1))       # bedroom 3
p.label("principal", ["PRINCIPAL", "BEDROOM"], 6.0, 4.4, 3.0, 2.0)
p.label("bath", ["PRINCIPAL", "BATHROOM"], 3.0, 3.6, 1.5, 7.0)
p.minor("BEDROOM 3", 4.5, 7.2)
p.top("FRONT")
p.bottom("SECOND FLOOR")
plans[3] = p

# ---------- Roof ----------
p = Plan(H)
p.dashed(0, 0, 6, 9)                          # parapet
for y in [0.6 + 0.5 * i for i in range(8)]:   # pitched front roof, slates
    p.el.append(f'<line x1="{X(0.3)}" y1="{Y(y)}" x2="{X(5.7)}" y2="{Y(y)}" stroke="{LIGHT}" stroke-width="0.8"/>')
p.small("ROOF", 3.0, 2.2)
p.outer(0, SY1, 4.4, SY2)                     # stair head
for xx in [0.6 + 0.4 * i for i in range(9)]:   # glazing bars
    p.el.append(f'<line x1="{X(xx)}" y1="{Y(SY1+0.1)}" x2="{X(xx)}" y2="{Y(SY2-0.1)}" stroke="{LIGHT}" stroke-width="0.8"/>')
p.small("GLAZED ROOF OVER THE STAIR", 2.2, 5.85)
p.door((4.4, 4.5), (4.4, 5.3), (1, 0))        # out onto the terrace
p.light_rect(0.3, 8.2, 5.7, 8.7, rx=4)         # planters along the back parapet
p.light_rect(5.2, 5.8, 5.7, 8.0, rx=4)
p.light_circle(2.0, 7.4, 12)
p.label("terrace", ["ROOF TERRACE"], 0, 0, 3.0, 6.6, dims_lines=["Out of sight of the mews"])
p.top("FRONT")
p.bottom("ROOF")
plans[4] = p

CENTRES = {"kitchen": (1, 3.0, 2.4), "dining": (1, 3.0, 7.2), "stair": (1, 2.1, 4.9),
           "living": (2, 3.0, 2.2), "bedroom": (2, 1.7, 7.2),
           "principal": (3, 3.0, 2.2), "bath": (3, 1.5, 7.2), "terrace": (4, 3.0, 7.2)}
out = {}
for f, pl in plans.items():
    open(f"em{f}.svg", "w").write(pl.svg())
for k, (f, mx, my) in CENTRES.items():
    out[k] = {"floor": f, "x": round(X(mx) / 368 * 100, 1), "y": round(Y(my) / plans[f].h * 100, 1)}
out["_sizes"] = {f: [368, pl.h] for f, pl in plans.items()}
json.dump(out, open("em-rooms.json", "w"), indent=1)
print(json.dumps(out))
