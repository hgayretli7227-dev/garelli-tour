# Frognal: detached late-Victorian house, 12 x 13 m, three floors, drawn in the Phillimore plan style.
# Ground floor with the 1921 conservatory and the garden falling away in three levels (terrace, lawn, orchard).
import json
import planlib as P
from planlib import Plan, X, Y, INK, TAUPE, LIGHT

P.configure(12.0, 13.0)
UPPER_H = round(Y(13.0) + 74 + 22)
G0, G1 = 13.3, 34.0           # garden, below the house
GROUND_H = round(Y(G1) + 82 + 22)
HL, HR = 4.6, 7.4             # central hall / landing
ST = (6.1, 7.1, 4.2, 9.4)     # oak staircase
plans = {}

# ---------- Ground floor ----------
p = Plan(GROUND_H)
# garden first, so the house draws over it
p.dashed(0, G0, 12, G1)
p.light_rect(7.4, 13.8, 11.6, 16.6)                  # stone terrace outside the kitchen
for y in (17.2, 17.45, 17.7):                        # steps down to the lawn
    p.el.append(f'<line x1="{X(0.4)}" y1="{Y(y)}" x2="{X(11.6)}" y2="{Y(y)}" stroke="{LIGHT}" stroke-width="0.8"/>')
for y in (26.4, 26.65, 26.9):                        # steps down to the orchard
    p.el.append(f'<line x1="{X(0.4)}" y1="{Y(y)}" x2="{X(11.6)}" y2="{Y(y)}" stroke="{LIGHT}" stroke-width="0.8"/>')
for cx, cy in [(1.6, 28.6), (4.6, 28.2), (7.6, 28.6), (10.5, 28.3), (3.0, 31.8), (6.1, 32.0), (9.2, 31.7)]:
    p.light_circle(cx, cy, 15)                       # old apple trees
p.small("TERRACE", 9.5, 15.2)
p.small("LAWN", 6.0, 24.8)
p.small("ORCHARD", 6.0, 33.4)
# conservatory, added in 1921
CX1, CX2, CY2 = 0.3, 6.9, 16.6
p.wall(CX1, 13, CX1, CY2); p.wall(CX2, 13, CX2, CY2); p.wall(CX1, CY2, CX2, CY2)
p.window_v(CX1, 13.5, 16.1); p.window_v(CX2, 13.5, 16.1); p.window_h(0.8, 6.4, CY2)
# house
p.outer()
p.wall(HL, 0, HL, 13); p.wall(HR, 0, HR, 13)
p.wall(0, 6.4, HL, 6.4); p.wall(HR, 5.4, 12, 5.4); p.wall(HL, 10.2, HR, 10.2)
p.window_h(0.8, 3.8, 0); p.window_h(8.2, 11.2, 0)
p.window_v(0, 1.0, 2.0); p.window_v(12, 3.8, 5.0); p.window_v(12, 7.0, 9.0); p.window_h(10.6, 11.6, 13)
p.door((5.5, 0), (6.5, 0), (0, 1))                  # front door
p.door((HL, 1.2), (HL, 2.2), (-1, 0))               # drawing room
p.door((HR, 1.2), (HR, 2.2), (1, 0))                # library
p.door((HL, 7.0), (HL, 8.0), (-1, 0))               # dining room
p.door((HR, 6.2), (HR, 7.2), (1, 0))                # kitchen
p.door((4.9, 10.2), (5.7, 10.2), (0, 1))            # cloakroom
p.door((2.2, 13), (3.2, 13), (0, 1))                # dining room to conservatory
p.door((8.2, 13), (9.2, 13), (0, 1)); p.door((10.2, 13), (9.2, 13), (0, 1))   # kitchen to terrace
p.stairs(*ST)
p.chimney_v(0, 2.6, 4.6, +1); p.chimney_v(0, 8.6, 10.6, +1); p.chimney_v(12, 1.4, 3.4, -1)
p.label("hall", ["ENTRANCE HALL"], 2.8, 10.2, 5.3, 5.1, rotate=True)
p.label("drawing", ["DRAWING", "ROOM"], 4.6, 6.4, 2.4, 3.2)
p.label("library", ["LIBRARY"], 4.6, 5.4, 9.7, 2.7)
p.label("dining", ["DINING", "ROOM"], 4.6, 6.6, 2.4, 9.7)
p.label("kitchen", ["KITCHEN"], 4.6, 7.6, 9.7, 9.2)
p.label("conservatory", ["CONSERVATORY"], 6.6, 3.6, 3.6, 14.9)
p.label("garden", ["GARDEN"], 0, 0, 6.0, 21.6, dims_lines=["0.4 acre · three levels"])
p.minor("WC", 6.0, 11.7)
p.top("FROGNAL")
p.bottom("GROUND FLOOR")
plans[1] = p

# ---------- First floor ----------
p = Plan(UPPER_H)
p.outer()
p.wall(HL, 0, HL, 13); p.wall(HR, 0, HR, 13)
p.wall(0, 6.4, HL, 6.4); p.wall(0, 10.0, HL, 10.0)
p.wall(HR, 5.4, 12, 5.4); p.wall(HR, 7.4, 12, 7.4); p.wall(HR, 10.2, 12, 10.2); p.wall(HL, 10.2, HR, 10.2)
p.window_h(0.8, 3.8, 0); p.window_h(8.2, 11.2, 0); p.window_h(5.4, 6.6, 0)
p.window_h(1.0, 3.6, 13); p.window_h(8.4, 11.0, 13)
p.window_v(0, 8.8, 9.7); p.window_v(12, 8.2, 9.4)
p.door((HL, 1.2), (HL, 2.2), (-1, 0))               # principal bedroom
p.door((0.15, 6.4), (0.85, 6.4), (0, 1))            # principal bath, through the bedroom
p.door((HL, 10.6), (HL, 11.6), (-1, 0))             # bedroom 3
p.door((HR, 1.2), (HR, 2.2), (1, 0))                # bedroom 2
p.door((HR, 5.8), (HR, 6.6), (1, 0))                # en suite
p.door((HR, 10.6), (HR, 11.6), (1, 0))              # bathroom
p.door((5.0, 10.2), (5.8, 10.2), (0, 1))            # linen
p.stairs(*ST)
p.chimney_v(0, 2.6, 4.6, +1); p.chimney_v(12, 1.4, 3.4, -1)
p.label("principal", ["PRINCIPAL", "BEDROOM"], 4.6, 6.4, 2.65, 3.2)
p.label("bath", ["PRINCIPAL", "BATHROOM"], 4.6, 3.6, 2.6, 8.3)
p.minor("BEDROOM 3", 2.4, 11.7)
p.minor("BEDROOM 2", 9.4, 2.9)
p.minor("EN SUITE", 9.7, 6.5)
p.minor("BATHROOM", 9.7, 11.7)
p.minor("LINEN", 6.0, 11.7)
p.minor("STUDY", 9.7, 8.8)
p.top("FRONT")
p.bottom("FIRST FLOOR")
plans[2] = p

# ---------- Second floor (in the roof) ----------
p = Plan(UPPER_H)
p.outer()
p.wall(HL, 0, HL, 13); p.wall(HR, 0, HR, 13)
p.wall(0, 6.4, HL, 6.4); p.wall(HR, 5.4, 12, 5.4); p.wall(HR, 8.6, 12, 8.6); p.wall(HL, 10.2, HR, 10.2)
p.window_h(1.4, 3.2, 0); p.window_h(8.8, 10.6, 0); p.window_h(1.4, 3.2, 13); p.window_h(8.8, 10.6, 13)
p.door((HL, 1.2), (HL, 2.2), (-1, 0))               # bedroom
p.door((HL, 10.6), (HL, 11.6), (-1, 0))             # bedroom 6
p.door((HR, 1.2), (HR, 2.2), (1, 0))                # bedroom 5
p.door((HR, 6.4), (HR, 7.4), (1, 0))                # bathroom
p.door((HR, 9.0), (HR, 9.8), (1, 0))                # shower room
p.door((5.0, 10.2), (5.8, 10.2), (0, 1))            # store
p.stairs(*ST)
p.label("bedroom", ["BEDROOM"], 4.6, 6.4, 2.4, 3.2)
p.minor("BEDROOM 6", 2.4, 9.7)
p.minor("BEDROOM 5", 9.7, 2.9)
p.minor("BATHROOM", 10.1, 7.2)
p.minor("SHOWER ROOM", 9.7, 11.6)
p.minor("STORE", 6.0, 11.7)
p.top("FRONT")
p.bottom("SECOND FLOOR")
plans[3] = p

CENTRES = {"hall": (1, 5.4, 2.6), "drawing": (1, 2.3, 3.2), "library": (1, 9.7, 2.7), "dining": (1, 2.3, 9.7),
           "kitchen": (1, 9.7, 9.2), "conservatory": (1, 3.6, 14.8), "garden": (1, 6.0, 22.6),
           "principal": (2, 2.3, 3.2), "bath": (2, 2.3, 8.2), "bedroom": (3, 2.3, 3.2)}
out = {}
for f, pl in plans.items():
    open(f"fr{f}.svg", "w").write(pl.svg())
for k, (f, mx, my) in CENTRES.items():
    out[k] = {"floor": f, "x": round(X(mx) / 368 * 100, 1), "y": round(Y(my) / plans[f].h * 100, 1)}
out["_sizes"] = {f: [368, pl.h] for f, pl in plans.items()}
json.dump(out, open("fr-rooms.json", "w"), indent=1)
print(json.dumps(out))
