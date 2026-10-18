/**
 * Geometry for the landing bento (BentoHero). The four big tiles are not
 * rectangles: the phone shot sits lower than the title and its lower-left
 * pushes a diagonal tongue down into the wide image; the product is a wedge
 * whose top climbs into the phone's row and whose left edge curves into the
 * wide image. Everything below is in px for a given canvas size so each tile
 * gets a `clip-path: path()` whose 12px gutter follows the seams.
 *
 * Grid: 12 columns, 5 rows, 12px gap. Columns 0-5 title, 6-11 phone (rows
 * 0-2); columns 0-7 wide image, 8-11 product (rows 3-4). Boxes are then
 * enlarged where a shape pokes past its cell and clipped back to the shape.
 */

export const GAP = 12;
const CORNER = 28;

type Vertex = {
  x: number;
  y: number;
  /** Corner radius at this vertex. */
  r?: number;
  /** Cubic controls of the segment that ARRIVES at this vertex. */
  c1?: [number, number];
  c2?: [number, number];
};

type Box = { x: number; y: number; w: number; h: number };

export type TileShape = Box & { clip: string };

export type BentoLayout = {
  title: TileShape;
  phone: TileShape;
  wide: TileShape;
  product: TileShape;
};

const f = (p: [number, number]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

function unit(dx: number, dy: number): [number, number] {
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
}

/**
 * Closed path through `vs` with arc-rounded corners where `r` is set.
 * Vertices are visited in order (clockwise in screen coordinates); a
 * vertex carrying c1/c2 is reached by a cubic rather than a line.
 */
function roundedPath(vs: Vertex[], origin: [number, number]): string {
  const n = vs.length;
  const pts = vs.map((v, i) => {
    const prev = vs[(i - 1 + n) % n];
    const next = vs[(i + 1) % n];
    const from = v.c2 ?? [prev.x, prev.y];
    const to = next.c1 ?? [next.x, next.y];
    const uin = unit(v.x - from[0], v.y - from[1]);
    const uout = unit(to[0] - v.x, to[1] - v.y);
    let r = v.r ?? 0;
    let t = 0;
    let sweep = 1;
    if (r > 0) {
      const dot = Math.max(-1, Math.min(1, uin[0] * uout[0] + uin[1] * uout[1]));
      const turn = Math.acos(dot);
      if (turn < 1e-3) {
        r = 0;
      } else {
        t = r * Math.tan(turn / 2);
        // Keep the trim inside the straight runs either side of the corner.
        const lin = v.c2 ? Infinity : Math.hypot(v.x - from[0], v.y - from[1]);
        const lout = next.c1 ? Infinity : Math.hypot(to[0] - v.x, to[1] - v.y);
        const maxT = Math.min(lin, lout) * 0.5;
        if (t > maxT) {
          t = maxT;
          r = t / Math.tan(turn / 2);
        }
        sweep = uin[0] * uout[1] - uin[1] * uout[0] > 0 ? 1 : 0;
      }
    }
    const pin: [number, number] = [v.x - uin[0] * t - origin[0], v.y - uin[1] * t - origin[1]];
    const pout: [number, number] = [v.x + uout[0] * t - origin[0], v.y + uout[1] * t - origin[1]];
    const c1 = v.c1 && ([v.c1[0] - origin[0], v.c1[1] - origin[1]] as [number, number]);
    const c2 = v.c2 && ([v.c2[0] - origin[0], v.c2[1] - origin[1]] as [number, number]);
    return { pin, pout, r, sweep, c1, c2 };
  });

  let d = `M${f(pts[0].pout)}`;
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n];
    d += p.c1 && p.c2 ? `C${f(p.c1)} ${f(p.c2)} ${f(p.pin)}` : `L${f(p.pin)}`;
    if (p.r > 0) d += `A${p.r.toFixed(1)} ${p.r.toFixed(1)} 0 0 ${p.sweep} ${f(p.pout)}`;
  }
  return d + "Z";
}

function tile(box: Box, vs: Vertex[]): TileShape {
  return { ...box, clip: `path("${roundedPath(vs, [box.x, box.y])}")` };
}

export function computeBento(W: number, H: number): BentoLayout {
  const g = GAP;
  const r = CORNER;
  const colW = (W - 11 * g) / 12;
  const rowH = (H - 4 * g) / 5;
  const x = (c: number) => c * (colW + g);

  const x6 = x(6); // phone's left edge
  const yB = 3 * rowH + 2 * g; // title's bottom
  const yT = yB + g; // wide image's top, under the title

  // The phone sits deeper than the title: its flat bottom is `drop` below
  // the title's bottom, and its lower-left runs out as a shallow diagonal
  // tongue whose tip pokes just under the title's bottom-right corner.
  const drop = 0.5 * rowH;
  const yP = yT + drop; // phone's flat bottom
  const yG = yP + g; // wide image's top, under the phone
  // The tongue: the phone's left edge ends at `knee`, bulges out to `tip`
  // (inside the title's bottom-right corner), then runs diagonally down to
  // `heel` on the flat bottom. The title is scooped along the same two
  // segments, one gutter away.
  const knee: [number, number] = [x6, yB - 0.95 * rowH];
  const tip: [number, number] = [x6 - 0.6 * colW, yB - 0.48 * rowH];
  const heel: [number, number] = [x6 + 1.4 * colW, yP];

  // Lines one gutter to the outside of each tongue segment (travelling
  // heel -> tip -> knee is clockwise for the phone, so "outside" is to the
  // left of travel).
  const outside = (P: [number, number], Q: [number, number]) => {
    const d = unit(Q[0] - P[0], Q[1] - P[1]);
    return { p: [P[0] + d[1] * g, P[1] - d[0] * g] as [number, number], d };
  };
  const diag = outside(heel, tip);
  const bulge = outside(tip, knee);
  const atX = (L: typeof diag, X: number): [number, number] => [X, L.p[1] + ((X - L.p[0]) * L.d[1]) / L.d[0]];
  const atY = (L: typeof diag, Y: number): [number, number] => [L.p[0] + ((Y - L.p[1]) * L.d[0]) / L.d[1], Y];
  // Where the two outside lines meet: the tip of the scoop.
  const det = diag.d[0] * bulge.d[1] - diag.d[1] * bulge.d[0];
  const tt = ((bulge.p[0] - diag.p[0]) * bulge.d[1] - (bulge.p[1] - diag.p[1]) * bulge.d[0]) / det;
  const tipOut: [number, number] = [diag.p[0] + diag.d[0] * tt, diag.p[1] + diag.d[1] * tt];
  const scoopIn = atX(bulge, x6 - g); // scoop enters the title's right edge here
  const scoopOut = atX(diag, x6 - g); // and leaves through the right edge again, above the corner
  // Wide image's top-right follows the diagonal between the two flat tops.
  const seamTop = atY(diag, yT)[0];
  const seamBot = atY(diag, yG)[0];

  // Product wedge: top climbs `rise` into the phone's row, left edge curves.
  const rise = 0.28 * rowH;
  const xp0 = x(8) + 0.4 * colW; // wedge top-left
  const xp1 = x(8) - 0.5 * colW; // wedge bottom-left
  const ctrl: [number, number] = [(xp0 + xp1) / 2 - 0.3 * colW, (yG + H) / 2];
  const ctrlL: [number, number] = [ctrl[0] - g, ctrl[1]];

  // The scoop is the tongue's outline pushed one gutter outward, so the two
  // run parallel: in along the bulge, round the tip, back out along the
  // diagonal to the right edge. Both ends are on the right edge, above the
  // corner, so no thin beak forms against the bottom edge.
  const title = tile({ x: 0, y: 0, w: x6 - g, h: yB }, [
    { x: 0, y: 0, r },
    { x: x6 - g, y: 0, r },
    { x: scoopIn[0], y: scoopIn[1], r: 24 },
    { x: tipOut[0], y: tipOut[1], r: 50 + g },
    { x: scoopOut[0], y: scoopOut[1], r: 24 },
    { x: x6 - g, y: yB, r },
    { x: 0, y: yB, r },
  ]);

  const phone = tile({ x: tip[0], y: 0, w: W - tip[0], h: yP }, [
    { x: x6, y: 0, r },
    { x: W, y: 0, r },
    { x: W, y: yP - rise, r },
    { x: xp0, y: yP, r: 22 },
    { x: heel[0], y: heel[1], r: 44 },
    { x: tip[0], y: tip[1], r: 50 },
    { x: knee[0], y: knee[1], r: 60 },
  ]);

  const wide = tile({ x: 0, y: yT, w: xp0, h: H - yT }, [
    { x: 0, y: yT, r },
    { x: seamTop, y: yT, r: 40 },
    { x: seamBot, y: yG, r: 40 },
    { x: xp0 - g, y: yG, r },
    { x: xp1 - g, y: H, c1: ctrlL, c2: ctrlL, r },
    { x: 0, y: H, r },
  ]);

  const product = tile({ x: xp1, y: yG - rise, w: W - xp1, h: H - (yG - rise) }, [
    { x: xp0, y: yG, r: 22, c1: ctrl, c2: ctrl },
    { x: W, y: yG - rise, r },
    { x: W, y: H, r },
    { x: xp1, y: H, r },
  ]);

  return { title, phone, wide, product };
}

/**
 * Server-side placement for the same four cells, as CSS calc() strings, so
 * the grid is right before JS measures anything. Plain rectangles; the
 * shapes arrive with the first layout pass.
 */
const COL = `((100% - ${11 * GAP}px) / 12 + ${GAP}px)`;
const ROW = `((100% - ${4 * GAP}px) / 5 + ${GAP}px)`;
const cell = (c0: number, cN: number, r0: number, rN: number) => ({
  "--l": `calc(${c0} * ${COL})`,
  "--t": `calc(${r0} * ${ROW})`,
  "--w": `calc(${cN} * ${COL} - ${GAP}px)`,
  "--h": `calc(${rN} * ${ROW} - ${GAP}px)`,
});

export const FALLBACK = {
  title: cell(0, 6, 0, 3),
  phone: cell(6, 6, 0, 3),
  wide: cell(0, 8, 3, 2),
  product: cell(8, 4, 3, 2),
} as const;
