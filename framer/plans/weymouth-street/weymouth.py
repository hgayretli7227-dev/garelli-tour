# Weymouth Street penthouse: two levels, 14 x 12 m, drawn in the Phillimore plan style.
# Lower floor: "one long living room" across the front (living, dining and kitchen zones), hall, lift and stair behind.
# Upper floor: set back from the parapet, three bedrooms, roof terrace wrapping the front and the right side.
import json
import planlib as P
from planlib import Plan, X, Y

P.configure(14.0, 12.0)
H = round(Y(12.0) + 74 + 22)
plans = {}
SX1, SX2, SY1, SY2 = 4.6, 5.6, 8.4, 11.8   # stone stair, same position on both levels

# ---------- Lower floor ----------
p = Plan(H)
p.outer()
p.wall(0, 6.4, 5.6, 6.4); p.wall(9.4, 6.4, 14, 6.4)     # the hall opens onto the long room
p.wall(4.6, 6.4, 4.6, 12); p.wall(10.4, 6.4, 10.4, 12)
p.wall(10.4, 9.0, 14, 9.0)
p.window_h(0.8, 3.2, 0); p.window_h(4.0, 6.4, 0); p.window_h(7.4, 9.6, 0); p.window_h(10.6, 13.2, 0)
p.window_v(0, 1.4, 4.8); p.window_v(0, 7.4, 10.6)
p.window_v(14, 1.4, 4.8); p.window_v(14, 7.0, 8.6); p.window_v(14, 9.8, 11.0)
p.stairs(SX1, SX2, SY1, SY2)
p.lift(9.0, 10.8, 10.2, 12.0)
p.door((4.6, 6.8), (4.6, 7.6), (-1, 0))     # study
p.door((10.4, 6.8), (10.4, 7.6), (1, 0))    # utility
p.door((11.0, 9.0), (11.8, 9.0), (0, 1))    # shower room, through the utility
p.label("living", ["LIVING ROOM"], 6.0, 6.4, 3.25, 3.2)
p.label("dining", ["DINING", "ROOM"], 3.6, 6.4, 8.1, 3.2)
p.label("kitchen", ["KITCHEN"], 4.4, 6.4, 11.95, 3.2)
p.label("hall", ["ENTRANCE", "HALL"], 5.8, 5.6, 8.0, 8.6)
p.minor("STUDY", 2.3, 9.2)
p.minor("UTILITY", 12.2, 7.9)
p.minor("SHOWER", 12.2, 10.2); p.minor("ROOM", 12.2, 10.9)
p.top("WEYMOUTH STREET")
p.bottom("LOWER FLOOR")
plans[1] = p

# ---------- Upper floor ----------
UX, UY = 11.4, 3.8
p = Plan(H)
p.dashed(0, 0, 14, 12)                      # parapet of the roof terrace
p.outer(0, UY, UX, 12)
p.wall(4.6, UY, 4.6, 12); p.wall(6.2, UY, 6.2, 12)
p.wall(0, 7.4, 4.6, 7.4); p.wall(6.2, 8.0, UX, 8.0); p.wall(6.2, 10.3, UX, 10.3)
p.window_h(2.2, 3.8, UY); p.window_h(4.9, 5.9, UY); p.window_h(8.2, 10.6, UY)
p.window_v(UX, 4.6, 7.2); p.window_v(UX, 8.6, 9.8)
p.door((0.6, UY), (1.4, UY), (0, -1))       # glazed doors onto the terrace
p.door((6.6, UY), (7.4, UY), (0, -1))
p.door((4.6, 4.5), (4.6, 5.3), (1, 0))      # principal bedroom, from the landing
p.door((4.6, 7.5), (4.6, 8.3), (1, 0))      # principal bath, from the landing
p.door((6.2, 6.0), (6.2, 6.8), (-1, 0))     # bedroom
p.door((6.2, 8.6), (6.2, 9.4), (1, 0))      # bedroom 3
p.door((6.2, 10.7), (6.2, 11.4), (1, 0))    # bathroom
p.stairs(SX1, SX2, SY1, SY2)
p.light_rect(0.4, 0.35, 13.6, 0.85, rx=4)   # planters along the parapet
p.light_rect(13.15, 1.2, 13.65, 11.6, rx=4)
p.light_rect(1.0, 1.5, 2.0, 3.3, rx=2); p.light_rect(2.4, 1.5, 3.4, 3.3, rx=2)   # loungers
p.light_circle(12.4, 7.4, 13)               # table
p.label("principal", ["PRINCIPAL", "BEDROOM"], 4.6, 3.6, 2.3, 5.6)
p.label("bath", ["PRINCIPAL", "BATH"], 4.6, 4.6, 2.3, 9.8)
p.label("bedroom", ["BEDROOM"], 5.2, 4.2, 8.8, 5.9)
p.label("terrace", ["ROOF TERRACE"], 0, 0, 7.6, 2.0, dims_lines=["85 m² · 915 sq ft"])
p.minor("BEDROOM 3", 9.0, 9.15)
p.minor("BATHROOM", 9.0, 11.15)
p.top("FRONT")
p.bottom("UPPER FLOOR")
plans[2] = p

CENTRES = {"hall": (1, 7.5, 9.2), "living": (1, 3.0, 3.2), "dining": (1, 7.8, 3.2), "kitchen": (1, 11.8, 3.2),
           "stair": (1, 5.1, 10.1), "principal": (2, 2.3, 5.6), "bath": (2, 2.3, 9.7), "bedroom": (2, 8.8, 5.9),
           "terrace": (2, 7.0, 1.9)}
out = {}
for f, pl in plans.items():
    open(f"wy{f}.svg", "w").write(pl.svg())
for k, (f, mx, my) in CENTRES.items():
    out[k] = {"floor": f, "x": round(X(mx) / 368 * 100, 1), "y": round(Y(my) / plans[f].h * 100, 1)}
out["_sizes"] = {f: [368, pl.h] for f, pl in plans.items()}
json.dump(out, open("wy-rooms.json", "w"), indent=1)
print(json.dumps(out))
