# Mallord Street: Chelsea townhouse c. 1912, 6.5 x 13 m, garden floor + three floors, drawn in the Phillimore plan style.
# Garden floor with the kitchen opening onto the 18 m south-facing garden; studio under the roof at the front (north light).
import json
import planlib as P
from planlib import Plan, X, Y, LIGHT

W, D = 6.5, 13.0
HX = 4.9                      # hall / landing wall
ST = (5.5, 6.5, 6.2, 11.2)    # wide timber staircase on the upper floors
plans = {}

# ---------- Garden floor (smaller scale so the 18 m garden fits) ----------
P.configure(W * 256 / 200, D)          # house drawn 200 px wide ...
P.X0 = 56 + 28                         # ... and centred
G0, G1 = 13.4, 31.4
GH = round(Y(G1) + 82 + 22)
p = Plan(GH)
p.dashed(0, G0, W, G1)
p.light_rect(0.3, G0 + 0.4, 6.2, G0 + 3.0)                       # stone terrace
for x in (0.25, 6.25):                                            # borders along both walls
    p.light_rect(x - 0.15, G0 + 3.6, x + 0.15, G1 - 1.0, rx=3)
p.light_rect(2.9, G0 + 3.4, 3.6, G1 - 2.6)                        # path down the lawn
p.light_circle(1.6, G1 - 1.4, 16); p.light_circle(5.0, G1 - 1.8, 13)   # trees at the end
p.small("TERRACE", 3.25, G0 + 1.7)
p.small("SOUTH-FACING", 1.6, G0 + 10.5)
p.outer(0, 0, W, D)
p.wall(0, 6.4, W, 6.4); p.wall(4.0, 0, 4.0, 6.4); p.wall(4.0, 2.6, W, 2.6)
p.stairs(5.45, 6.5, 2.9, 6.2)
p.window_h(0.6, 3.4, 0); p.window_h(4.6, 5.9, 0)
p.door((4.0, 3.2), (4.0, 4.2), (-1, 0))                           # bedroom 4
p.door((4.3, 2.6), (5.2, 2.6), (0, -1))                           # shower room
p.door((4.2, 6.4), (5.2, 6.4), (0, 1))                            # kitchen
p.door((1.0, D), (2.3, D), (0, 1)); p.door((3.6, D), (2.3, D), (0, 1))   # glazed doors to the garden
p.window_h(4.4, 6.0, D)
p.label("kitchen", ["KITCHEN"], W, 6.6, 3.25, 9.5)
p.label("garden", ["GARDEN"], 0, 0, 3.25, G0 + 8.0, dims_lines=["18 m · 59′ long"])
p.minor("BEDROOM 4", 2.0, 3.0)
p.small("SHOWER", 5.25, 1.1); p.small("ROOM", 5.25, 1.6)
p.top("MALLORD STREET")
p.bottom("GARDEN FLOOR")
plans[1] = p

# ---------- Upper floors, full scale ----------
P.configure(W, D)
P.X0 = 56
UH = round(Y(D) + 74 + 22)

# Ground floor
p = Plan(UH)
p.outer()
p.wall(HX, 0, HX, D); p.wall(0, 6.4, HX, 6.4)
p.stairs(*ST)
p.window_h(0.6, 2.2, 0); p.window_h(2.8, 4.4, 0); p.window_h(0.8, 4.0, D); p.window_h(5.2, 6.2, D)
p.door((5.2, 0), (6.2, 0), (0, 1))                                # front door
p.door((HX, 1.4), (HX, 2.4), (-1, 0))                            # drawing room
p.door((HX, 7.0), (HX, 8.0), (-1, 0))                            # dining room
p.door((5.5, 11.8), (6.3, 11.8), (0, 1)); p.wall(HX, 11.6, W, 11.6)   # cloakroom under the stair landing
p.chimney_v(0, 2.2, 4.2, +1); p.chimney_v(0, 8.6, 10.6, +1)
p.label("hall", ["ENTRANCE HALL"], 1.6, 13.0, 5.7, 3.4, rotate=True)
p.label("drawing", ["DRAWING", "ROOM"], HX, 6.4, 2.6, 3.3)
p.minor("DINING ROOM", 2.6, 9.6)
p.small("WC", 5.7, 12.3)
p.top("FRONT")
p.bottom("GROUND FLOOR")
plans[2] = p

# First floor
p = Plan(UH)
p.outer()
p.wall(HX, 0, HX, D); p.wall(0, 6.0, HX, 6.0); p.wall(0, 8.6, HX, 8.6)
p.stairs(*ST)
p.window_h(0.6, 2.2, 0); p.window_h(2.8, 4.4, 0); p.window_h(5.2, 6.2, 0)
p.window_h(0.8, 4.0, D); p.window_v(0, 6.8, 7.8)
p.door((HX, 1.4), (HX, 2.4), (-1, 0))                            # principal bedroom
p.door((HX, 6.6), (HX, 7.6), (-1, 0))                            # bathroom
p.door((HX, 9.4), (HX, 10.4), (-1, 0))                           # study
p.chimney_v(0, 2.2, 4.2, +1); p.chimney_v(0, 10.0, 12.0, +1)
p.label("principal", ["PRINCIPAL", "BEDROOM"], HX, 6.0, 2.6, 3.0)
p.label("bath", ["BATHROOM"], HX, 2.6, 2.45, 7.0)
p.label("study", ["STUDY"], HX, 4.4, 2.6, 10.6)
p.top("FRONT")
p.bottom("FIRST FLOOR")
plans[3] = p

# Second floor, under the roof
p = Plan(UH)
p.outer()
p.wall(0, 5.6, W, 5.6); p.wall(HX, 5.6, HX, D); p.wall(0, 8.6, HX, 8.6); p.wall(1.9, 5.6, 1.9, 8.6)
p.stairs(*ST)
p.window_h(0.4, 6.1, 0)                                           # the tall north window across the studio
p.window_h(0.8, 4.0, D)
p.door((5.0, 5.6), (5.8, 5.6), (0, -1))                           # studio
p.door((HX, 6.0), (HX, 6.8), (-1, 0))                             # bedroom 3
p.door((1.9, 6.4), (1.9, 7.2), (-1, 0))                           # shower room, off bedroom 3
p.door((HX, 9.4), (HX, 10.4), (-1, 0))                            # bedroom
p.label("studio", ["STUDIO"], W, 5.6, 3.25, 2.7)
p.small("NORTH LIGHT", 3.25, 0.6)
p.label("bedroom", ["BEDROOM"], HX, 4.4, 2.6, 10.7)
p.minor("BEDROOM 3", 3.4, 7.4)
p.small("SHOWER", 0.95, 7.6); p.small("ROOM", 0.95, 8.1)
p.top("FRONT")
p.bottom("SECOND FLOOR")
plans[4] = p

# Plan X/Y (each plan has its own scale and origin, so convert per floor)
def pct(f, mx, my):
    if f == 1:
        P.configure(W * 256 / 200, D); P.X0 = 84
    else:
        P.configure(W, D); P.X0 = 56
    return {"floor": f, "x": round(X(mx) / 368 * 100, 1), "y": round(Y(my) / plans[f].h * 100, 1)}

CENTRES = {"kitchen": (1, 3.25, 9.7), "garden": (1, 3.25, 22.4), "hall": (2, 5.7, 3.4), "drawing": (2, 2.45, 3.2),
           "study": (3, 2.45, 10.8), "principal": (3, 2.45, 3.0), "bath": (3, 2.45, 7.3), "bedroom": (4, 2.45, 10.8),
           "studio": (4, 3.25, 2.8)}
out = {k: pct(*v) for k, v in CENTRES.items()}
for f, pl in plans.items():
    open(f"ms{f}.svg", "w").write(pl.svg())
out["_sizes"] = {f: [368, pl.h] for f, pl in plans.items()}
json.dump(out, open("ms-rooms.json", "w"), indent=1)
print(json.dumps(out))
