---
name: ascii-motion
description: Make original animated ASCII art as a self-contained web page, in the ascii.rest style — halftone colour scenes, shaded mono 3D/fields, line-drawn sprites, particle sims, type/UI. Use for ASCII art, character art, halftone or dot-matrix animation, text-mode animation, or "make something like ascii.rest". Requests may come in any language. Always ask which style first.
license: MIT (portions adapted from ascii.rest, MIT; see THIRD_PARTY_NOTICES.md)
compatibility: Any agent that can write files and run python3. Headless Chromium (Playwright or Puppeteer) is optional, for the verify step.
metadata:
  version: "1.0.0"
---

# ASCII Motion

Original, animated ASCII pieces drawn on a character grid, rendered to a `<canvas>` (colour) or `<pre>` (one ink). The craft follows ascii.rest by @bas3line (MIT): every piece is a pure function `frame(t) → text`, the colour is a palette index per cell, and a tiny runtime plays it. You write new pieces with this technique. You do not copy theirs.

## Step 1 — Ask before building (mandatory)

Before writing any code, ask the user these questions, in the user's language, all in one turn. If the agent has a question tool (for example AskUserQuestion in Claude Code), use it. Otherwise, ask in chat as a short numbered list with the options, and wait for the reply. Skip a question only if the user's message already answers it.

**Q1 Style (header "Style"):** offer the four main families. Mention in the question text that type/UI/data and logo glint are also available (through "Other" in a question tool, or as extra choices in chat).

| Option | Look | Reference pieces on ascii.rest |
|---|---|---|
| Halftone scene | full-colour landscape in dots ` ·•●`, 200×100, cinematic light | night-coast, ocean-sunset, kyoto-dusk, deep-reef |
| Shaded mono | one ink, brightness ramp `.,-~:;=!*#$@`, lit 3D forms or maths fields | donut, plasma, black-hole, mandelbrot |
| Line sprite | hand-drawn characters `/\_()'` with timed poses: creatures, objects | owl, cat, whale, train, windmill |
| Particles & sim | many small marks moving by simple physics | fireworks, rain, falling-sand, flow-field |

**Q2 Subject & mood (header "Subject"):** offer three or four concrete subjects that fit the chosen style. If the style is still unknown, offer neutral ones: night sea, mountain dawn, a creature, an abstract form. Each option description names the light source and the one motion, e.g. "moonlight; slow swell + drifting cloud".

**Q3 Delivery (header "Delivery"):** a standalone HTML file (default), a published Artifact page (only where the agent can publish one), or a drop-in `<script>`+element snippet for the user's own site.

If the session is unattended, choose the style that best fits the request, state it in one line, and proceed.

## Step 2 — Design on paper (one short paragraph, internal)

Decide these before coding. They are what taste comes from:
1. **One light story.** Name the key light (moon, sun, lamp, lantern) and where it sits. Everything else is lit *from* it: halos, rim light on the facing edge, reflections, a road of glints on water.
2. **Two or three silhouettes** big enough to read as a thumbnail. Silhouettes are *absence* of dots (low `floor`), not dark dots.
3. **One primary motion, one or two secondary ones.** Examples: a beam turns, clouds drift, water swells. Never animate everything.
4. **A loop.** Make periods whole divisors of one loop (e.g. 8 s, 12 s, 30 s) so nothing jumps.
5. **The palette:** 25–46 hand-picked hexes in ramps (sky blues dark→light, warm lamp 3–4 steps, land greens/greys, one accent). Ground colour ≈ the darkest sky, not pure black.

## Step 3 — Build with the kit

Copy `scripts/ascii-kit.js` from this skill (the same code is below; write it out verbatim if the file is not reachable) and write one piece file into the working directory, then bundle them into a single self-contained HTML file with `bundle.py`. Keep the piece contract exact; it is also compatible with ascii.rest's own `mount`.

**Piece contract**
```js
export const meta = { name, note, cols, rows, fps, cell /* 1 = square cells (halftone), 2 = text cells */, palette /* colour pieces only */, ground, options };
export default function make(options) { /* build static layers once */ return (t, { paper, color }) => text; }
```
- `t` is seconds. `paper` is true on a light page: flip ramps so dense ink means dark. `color` is a `Uint8Array(cols*rows)`; write palette indices into it.
- Precompute everything static (terrain masks, sprite strings, cloud fields that wrap with `noise(..., period)`) in `make`, outside the frame function. Frames must be cheap: 200×100 at 15 fps.

### ascii-kit.js
```js
// ascii-kit: runtime + helpers for animated ASCII pieces.
// Part of ascii-motion (MIT License, Copyright (c) 2026 ascii-motion contributors).
// mount(), halftone(), hash() and noise() are adapted from ascii.rest by bas3line
// (https://github.com/bas3line/ascii), used under this license:
//
//   MIT License
//
//   Copyright (c) 2026 bas3line (https://github.com/bas3line)
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
//
// Piece contract (compatible with ascii.rest, MIT):
//   export const meta = { name, note, cols, rows, fps, cell?, palette?, ground?, options? }
//   export default (options) => (t, { paper, color }) => string   // rows joined by "\n"
//   Coloured pieces write a palette index per cell into color[y*cols+x].

// ---------- math ----------
export const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
export const mix = (a, b, k) => a + (b - a) * k;
export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export function hash(x, y) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
// value noise; wraps every `period` lattice cells in x when period > 0 (for endless drift)
export function noise(x, y, period = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  let x0 = xi, x1 = xi + 1;
  if (period) { x0 = ((xi % period) + period) % period; x1 = (x0 + 1) % period; }
  const a = hash(x0, yi), b = hash(x1, yi), c = hash(x0, yi + 1), d = hash(x1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, oct = 4, period = 0) {
  let s = 0, n = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += amp * noise(x * f, y * f, period * f); n += amp; amp *= 0.5; f *= 2; }
  return s / n;
}

// ---------- halftone scenes (cell: 1, ~200×100, " ·•●") ----------
const DOTS = " ·•●", COVER = [0, 0.3, 0.6, 1];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.47);
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
// shade(s, x, y, t, col, row): set s.r s.g s.b (linear-ish 0..1+), optionally s.floor (min dot level), s.fade.
export function halftone(meta, shade) {
  const W = meta.cols, H = meta.rows, P = meta.palette.map(hex);
  const lut = new Uint8Array(32768).fill(255);
  const nearest = (r, g, b) => {
    const k = (Math.min(31, (r * 31.99) | 0) << 10) | (Math.min(31, (g * 31.99) | 0) << 5) | Math.min(31, (b * 31.99) | 0);
    if (lut[k] !== 255) return lut[k];
    let best = 0, bd = 1e9;
    for (let i = 0; i < P.length; i++) {
      const dr = P[i][0] - r, dg = P[i][1] - g, db = P[i][2] - b, d = 0.3 * dr * dr + 0.5 * dg * dg + 0.2 * db * db;
      if (d < bd) (bd = d), (best = i);
    }
    return (lut[k] = best);
  };
  const out = new Array(W), lines = new Array(H), s = { r: 0, g: 0, b: 0, floor: 0.3, fade: 1 };
  return (t, { color } = {}) => {
    for (let r = 0; r < H; r++) {
      for (let x = 0; x < W; x++) {
        s.r = s.g = s.b = 0; s.floor = 0.3; s.fade = 1;
        shade(s, x + 0.5, r + 0.5, t, x, r);
        // dot size from brightness, dithered; colour makes up what dot size could not
        const peak = Math.max(s.r, s.g, s.b, 1e-4);
        const level = clamp(s.floor + (1 - s.floor) * Math.pow(peak, 0.85) * 0.95) * s.fade;
        const step = Math.max(0, Math.min(3, Math.round(level * 3 + BAYER[(r & 3) * 4 + (x & 3)])));
        out[x] = DOTS[step];
        if (color) {
          const want = step ? Math.min(1, (level + 0.06) / COVER[step]) : 0, k = (0.3 + 0.7 * want) / peak;
          color[r * W + x] = nearest(clamp(s.r * k), clamp(s.g * k), clamp(s.b * k));
        }
      }
      lines[r] = out.join("");
    }
    return lines.join("\n");
  };
}

// ---------- mono ramp fields (cell: 2, text cells are ~2× taller than wide) ----------
// field(x, y, t) → 0..1 brightness, or -1 for empty. x,y in cell widths from centre (y already ×2).
export function ramp(meta, field, RAMP = ".,-~:;=!*#$@") {
  const { cols, rows } = meta, N = RAMP.length, out = new Array(cols), lines = new Array(rows);
  return (t, { paper = false } = {}) => {
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5 - rows / 2) * 2;
      for (let c = 0; c < cols; c++) {
        const v = field(c + 0.5 - cols / 2, y, t);
        if (v < 0) { out[c] = " "; continue; }
        const i = Math.min(N - 1, Math.floor(clamp(v) * N));
        out[c] = RAMP[paper ? N - 1 - i : i]; // light page: dense ink = dark, so flip
      }
      lines[r] = out.join("");
    }
    return lines.join("\n");
  };
}

// ---------- sprites ----------
export const FLIP = { "/": "\\", "\\": "/", "(": ")", ")": "(", "<": ">", ">": "<", "[": "]", "]": "[", "{": "}", "}": "{", "`": "'", "'": "`" };
export const mirror = (half, w = Math.max(...half.map((l) => l.length))) =>
  half.map((l) => { l = l.padEnd(w); return l + [...l.slice(0, w - 1)].reverse().map((c) => FLIP[c] || c).join(""); });
export function grid(cols, rows) {
  const g = Array.from({ length: rows }, () => new Array(cols).fill(" "));
  return {
    g,
    put(x, y, s, transparent = true) { if (y < 0 || y >= rows) return; for (let i = 0; i < s.length; i++) { const X = x + i; if (X >= 0 && X < cols && !(transparent && s[i] === " ")) g[y][X] = s[i]; } },
    clear() { for (const row of g) row.fill(" "); },
    text() { return g.map((r) => r.join("")).join("\n"); },
  };
}

// ---------- runtime ----------
const rgb = (css) => (css[0] === "#" ? [1, 3, 5].map((i) => parseInt(css.slice(i, i + 2), 16)) : (css.match(/[\d.]+/g) || []).map(Number));
const isDark = (css) => { const c = rgb(css); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 128; };
export function mount(el, piece, options = {}) {
  const meta = piece.meta, { fps = meta.fps ?? 30, motion = false, ...rest } = { ...meta.options, ...options };
  const frame = piece.default(rest);
  const { cols, rows, palette, ground, cell = 2 } = meta;
  const canvas = el instanceof HTMLCanvasElement ? el : null;
  const color = palette && canvas ? new Uint8Array(cols * rows) : undefined;
  let t = 0, draw, ro;
  if (!canvas) {
    draw = () => { el.textContent = frame(t, { paper: isDark(getComputedStyle(el).color) }); };
  } else {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;
    canvas.style.display ||= "block"; canvas.style.width ||= "100%";
    canvas.style.aspectRatio = `${cols} / ${rows * cell}`;
    const size = () => {
      w = (canvas.clientWidth * (devicePixelRatio || 1)) / cols; h = w * cell;
      canvas.width = Math.round(w * cols); canvas.height = Math.round(h * rows);
    };
    const buckets = new Map();
    draw = () => {
      const ink = getComputedStyle(canvas).color;
      const text = frame(t, { paper: ground ? !isDark(ground) : isDark(ink), color });
      if (ground) { ctx.fillStyle = ground; ctx.fillRect(0, 0, canvas.width, canvas.height); } else ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${w / 0.6}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      buckets.forEach((a) => (a.length = 0));
      for (let k = 0, x = 0, y = 0; k < text.length; k++) {
        const c = text.charCodeAt(k);
        if (c === 10) { x = 0; y++; continue; }
        if (c !== 32) { const ci = color ? color[y * cols + x] : 0; let a = buckets.get(ci); if (!a) buckets.set(ci, (a = [])); a.push(c, x, y); }
        x++;
      }
      buckets.forEach((a, ci) => {
        if (!a.length) return;
        ctx.fillStyle = palette ? palette[ci] : ink; // one fillStyle per colour
        for (let i = 0; i < a.length; i += 3) ctx.fillText(String.fromCharCode(a[i]), (a[i + 1] + 0.5) * w, (a[i + 2] + 0.5) * h);
      });
    };
    size();
    ro = new ResizeObserver(() => { size(); draw(); }); ro.observe(canvas);
  }
  draw();
  if (!fps) return () => ro?.disconnect();
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0, last = 0, seen = false;
  const tick = (now) => { raf = requestAnimationFrame(tick); const dt = now - last; if (dt < 1000 / fps - 2) return; last = now; t += Math.min(dt, 100) / 1000; draw(); };
  const run = () => {
    const go = seen && !document.hidden && (motion || !still.matches);
    if (go && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } else if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  const io = new IntersectionObserver((e) => { seen = e[e.length - 1].isIntersecting; run(); }); io.observe(el);
  document.addEventListener("visibilitychange", run); still.addEventListener("change", run);
  return () => { io.disconnect(); ro?.disconnect(); cancelAnimationFrame(raf); raf = 0; document.removeEventListener("visibilitychange", run); still.removeEventListener("change", run); };
}
```

### bundle.py
```python
# usage: python3 bundle.py kit.js piece.js out.html "Title"
import html,re,sys
kit,piece,out,title=sys.argv[1:5]
title=html.escape(title)
strip=lambda s:re.sub(r'^import .*?;\s*$','',re.sub(r'^export (default )?','',s,flags=re.M),flags=re.M)
k=strip(open(kit,encoding='utf-8').read())
p=open(piece,encoding='utf-8').read()
p=re.sub(r'^import .*?;\s*$','',p,flags=re.M).replace('export const meta','const meta').replace('export default function','function make')
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<!-- technique after ascii.rest (MIT, @bas3line) -->
<title>{title}</title><style>
:root{{--bg:#080b12;--ink:#cfd6e6}}@media (prefers-color-scheme:light){{:root{{--bg:#f4f1ea;--ink:#1d2230}}}}
html,body{{margin:0;min-height:100%;background:var(--bg);color:var(--ink)}}
body{{display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}}
.stage{{width:min(100%,1200px)}}pre.stage{{width:auto;font:clamp(9px,1.6vw,15px)/1.2 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;margin:0;white-space:pre}}
canvas.stage{{border-radius:6px}}</style></head><body>
<div id="host"></div>
<script type="module">
{k}
{p}
const piece={{meta,default:make}};
const el=document.createElement(meta.palette?"canvas":"pre");el.className="stage";el.setAttribute("role","img");el.setAttribute("aria-label",meta.note||meta.name);
document.getElementById("host").replaceWith(el);
mount(el,piece,Object.fromEntries(new URLSearchParams(location.search).has("motion")?[["motion",true]]:[]));
</script></body></html>'''
open(out,'w',encoding='utf-8').write(page)
```
Run: `python3 scripts/bundle.py ascii-kit.js my-piece.js out.html "Title"` (the skill's `scripts/bundle.py`, or a copy of the code above). Add `?motion` to the URL to play even under reduced motion (useful for screenshots).

## Style recipes

### A. Halftone scene — `cell: 1`, 200×100, fps 15, palette 25–46
The `halftone()` helper does the signature step. You write `shade(s, x, y, t)` and set linear `s.r/g/b` in the 0–1 range (light may add past 1). The helper picks the dot size from the peak brightness with 4×4 Bayer dither, then brightens small dots and dims large ones, so gradients stay smooth across dither steps. It snaps the colour to the nearest palette entry through a cached 32³ LUT.

Layering order inside `shade`: sky gradient (+ faint fbm haze, so it is never flat) → halo around the key light → body of the light → stars (hash threshold ≈ 0.98, twinkle, suppressed by the halo) → clouds (wrapping fbm, lit on the side toward the light: compare density with a sample offset toward the light) → land/silhouettes (mask built once, `floor` 0.03–0.1, rim light on the edge facing the light) → water (rows below the horizon: swell noise stretched along x, the light's road `exp(-(dx/width)^2)` widening toward the viewer, broken into glints by `smooth(0.5,0.8,wave)`) → additive local lights (lamp glow `exp(-d/2..4)` plus a wide faint one) → `s.fade` thins the bottom rows into the ground.

`s.floor` sets the minimum dot level. Use about 0.12–0.3 for open sky and sea, so they keep fine texture, and a low value for silhouettes.

Worked example (tested):
```js
import { halftone, fbm, noise, hash, smooth, clamp } from "./ascii-kit.js";
export const meta = {
  name: "harbour moon", note: "a moon rising over a still bay, a moored sloop's lamp swaying",
  cols: 200, rows: 100, cell: 1, fps: 15, ground: "#070a12",
  palette: ["#121a33","#18244a","#203060","#2a3d78","#384f90","#4b65a8","#6380bd","#8199c8","#a2b3d6","#c4cfe4","#e3e8f2","#f8f9fd",
            "#ffe3a0","#ffc56a","#e48f3c","#0e1418","#18222a","#24323c","#344652"],
};
const HZ = 64, MOON = [128, 30];
export default function () {
  const ridge = (x) => HZ - 2 - 16 * smooth(0, 70, x) * smooth(150, 80, x) * (0.6 + 0.6 * fbm(x * 0.03, 1.3, 4)) - 6 * smooth(160, 200, x) * fbm(x * 0.06, 7, 2);
  return halftone(meta, (s, x, y, t) => {
    const dmx = x - MOON[0], dmy = y - MOON[1], dm = Math.hypot(dmx, dmy);
    const boat = 62, sway = Math.sin(t * 0.9) * 0.9; // the sloop
    const hull = y > HZ + 6 && y < HZ + 8.5 && Math.abs(x - boat) < 9 - (y - HZ - 6) * 1.6;
    const mast = Math.abs(x - (boat + sway * ((HZ + 6 - y) / 26))) < 0.6 && y > HZ - 20 && y <= HZ + 6;
    const sail = y > HZ - 18 && y < HZ + 4 && x > boat + 1 && x < boat + 1 + (y - (HZ - 18)) * 0.42;
    if (hull || mast || sail) {
      const k = sail ? 0.35 + 0.25 * smooth(boat, boat + 9, x) : 0.06;
      s.r = k * 0.8; s.g = k * 0.85; s.b = k; s.floor = sail ? 0.2 : 0.05; return;
    }
    if (y < HZ) {
      const v = y / HZ, halo = Math.exp(-dm / 22) * 0.3 + Math.exp(-dm / 8) * 0.5;
      const gh = Math.pow(v, 4) * 0.3; s.r = 0.03 + 0.08 * v * v + gh * 0.7 + 0.28 * halo; s.g = 0.05 + 0.1 * v * v + gh * 0.8 + 0.32 * halo; s.b = 0.13 + 0.18 * v * v + gh + 0.4 * halo; s.floor = 0.12;
      if (dm < 7) { const f = 0.84 + 0.16 * fbm(x * 0.4, y * 0.4, 2); const a = smooth(7, 6, dm); s.r += (0.98 * f - s.r) * a; s.g += (0.97 * f - s.g) * a; s.b += (0.92 * f - s.b) * a; }
      else if (hash(x | 0, (y | 0) * 3 + 5) > 0.984) { const tw = 0.6 + 0.4 * Math.sin(t * 2 + hash(y | 0, x | 0) * 6.3); const st = tw * (1 - halo) * smooth(HZ, 15, y); s.r = Math.max(s.r, st); s.g = Math.max(s.g, st); s.b = Math.max(s.b, st); }
      const top = ridge(x); if (y > top) { const sh = fbm(x * 0.2, y * 0.2, 3), rim = smooth(top + 1.5, top, y) * smooth(40, 120, x); s.r = 0.03 + 0.04 * sh + 0.3 * rim; s.g = 0.04 + 0.05 * sh + 0.34 * rim; s.b = 0.07 + 0.07 * sh + 0.42 * rim; s.floor = 0.03; }
    } else {
      const v = (y - HZ) / (100 - HZ);
      const w = 0.6 * noise(x * 0.06 + t * 0.1, y * 0.5 - t * 0.5) + 0.4 * noise(x * 0.18 - t * 0.2, y * 0.9 - t);
      const sw = 0.5 + 0.9 * w;
      s.r = (0.07 - 0.03 * v) * sw; s.g = (0.11 - 0.05 * v) * sw; s.b = (0.25 - 0.1 * v) * sw;
      const road = Math.exp(-(((x - MOON[0]) / (2.5 + (y - HZ) * 0.5)) ** 2)), gl = smooth(0.5, 0.8, w) * road;
      s.r += 0.9 * gl + 0.06 * road; s.g += 0.9 * gl + 0.08 * road; s.b += 0.9 * gl + 0.14 * road;
      const lamp = Math.exp(-(((x - boat - sway * 0.8) / (1 + (y - HZ) * 0.18)) ** 2)) * smooth(0.45, 0.8, w) * smooth(HZ + 8, HZ + 10, y) * 0.9;
      s.r += lamp; s.g += lamp * 0.7; s.b += lamp * 0.3;
      const hz = Math.exp(-(y - HZ) / 2.5) * 0.15; s.r += hz * 0.8; s.g += hz * 0.9; s.b += hz;
      s.floor = 0.16; s.fade = smooth(100, 76, y);
    }
    // the masthead lamp and its glow
    const lx = boat + sway, ly = HZ - 20, dl = Math.hypot(x - lx, y - ly);
    const g = Math.exp(-dl / 2.2) * 0.9 + Math.exp(-dl / 9) * 0.12 * (0.9 + 0.1 * Math.sin(t * 7));
    s.r += g; s.g += g * 0.75; s.b += g * 0.35;
  });
}
```
Scene ideas in this style: alpine dawn with mist on a lake, a pagoda at dusk with a stone lantern, a reef with god-rays and a turning fish school, desert milky way with meteors, a thunderhead flickering over wheat, a city bay with a necklace of lamps, earthrise over a cratered horizon.

### B. Shaded mono — `cell: 2`, ~40–72 × 15–30, fps 20–30, no palette
Use `ramp(meta, field, RAMP)`. `field(x, y, t)` returns 0–1 brightness, or −1 for empty cells. The x and y arguments are in cell widths from the centre, with y already doubled because text cells are about 2× taller than wide. For 3D, project and z-buffer as in donut.c, and pick the ramp index from the Lambert term N·L. For fields such as plasma or a Julia set, fold the value up and down the ramp (`abs(u − 2·round(u/2))`) so it cycles smoothly.

Ramps: `.,-~:;=!*#$@` (classic), ` .:-=+*#%@` (soft, empty-friendly), ` ░▒▓█` (blocks, for glitch/TV).
```js
import { ramp } from "./ascii-kit.js";
export const meta = { name: "lit sphere", note: "a sphere under a light that circles it", cols: 48, rows: 22, fps: 30 };
export default function () {
  const R = 19;
  return ramp(meta, (x, y, t) => {
    const d2 = (x * x + y * y) / (R * R); if (d2 > 1) return -1;
    const nz = Math.sqrt(1 - d2), nx = x / R, ny = -y / R;
    const lx = Math.cos(t * 0.9), lz = Math.sin(t * 0.9) * 0.6 + 0.5, ly = 0.45, m = Math.hypot(lx, ly, lz);
    const lam = Math.max(0, (nx * lx + ny * ly + nz * lz) / m);
    const band = 0.08 * Math.sin(ny * 14 + nx * 2); // a little banding, like a gas giant
    return 0.06 + 0.94 * Math.pow(lam, 0.9) + band * lam;
  });
}
```

### C. Line sprite — `cell: 2`, small grid (30–80 × 15–30), fps 8–15
Draw with ASCII strokes (slashes, underscore, pipe, parentheses, quote, backtick, dot, dash) and scallops `( ( (`. Make symmetric bodies as one half plus `mirror()` (which flips `/\()<>[]{}`). Motion is a schedule, not physics: keep arrays of `[start, end, from, to]` pose steps and blink start times inside a fixed loop, ease between poses, and *snap* to whole cells, because a sprite never blurs. Give life with small things: blinks that close fast and open slower, breathing (one row rising every 3–4 s), a head turn in three poses. Use `grid().put(x, y, str)` with spaces left transparent.
```js
import { grid, ease } from "./ascii-kit.js";
export const meta = { name: "lantern", note: "a paper lantern swaying on its cord, the flame breathing", cols: 30, rows: 16, fps: 12 };
const BODY = ["  .-\"\"\"\"-.  ", " /  ____  \\ ", "|  /    \\  |", "|  |    |  |", "|  \\____/  |", " \\        / ", "  `-....-'  "];
const FLAME = [["  ", "()", "\\/"], ["  ", "{}", "\\/"], [" ,", "()", "\\/"]];
export default function () {
  const G = grid(meta.cols, meta.rows);
  return (t) => {
    G.clear();
    const sway = Math.round(Math.sin(t * 1.4) * 2.4); // whole cells only: sprites snap, they don't blur
    const cx = 9 + sway;
    for (let y = 0; y < 5; y++) G.put(14 + Math.round(sway * y / 5), y, "|");
    G.put(cx + 3, 5, "_[==]_");
    BODY.forEach((l, i) => G.put(cx, 6 + i, l));
    const f = FLAME[Math.floor(t * 6) % 3];
    f.forEach((l, i) => G.put(cx + 5, 8 + i, l));
    G.put(cx + 4, 13, "  ||  ");
    G.put(cx + 4, 14, "  ''  ");
    return G.text();
  };
}
```

### D. Particles & sim — `cell: 2`, fps 15–30
Particles are deterministic from `hash(i, k)`, so the piece is the same on every load. Position is a smooth function of `t`, or a fixed-step integrator inside the frame. Brightness maps to a short glyph ramp (` .·+*`, or `.oO@` for heavier marks). Trails come from keeping the last N positions and drawing them through a dimmer ramp. Ground the scene with one static or slow element, such as grass, a basin, or a horizon.
```js
import { grid, hash, noise } from "./ascii-kit.js";
export const meta = { name: "firefly-meadow", note: "a firefly meadow: small lights drifting over long grass, flashing in turn", cols: 60, rows: 18, fps: 15 };
const GLOW = " .·+*"; // particle brightness ramp
export default function ({ count = 32 } = {}) {
  const G = grid(meta.cols, meta.rows);
  const flies = Array.from({ length: count }, (_, i) => ({ x: hash(i, 1) * 60, y: 3 + hash(i, 2) * 10, ph: hash(i, 3) * 6.28, sp: 0.6 + hash(i, 4) }));
  return (t) => {
    G.clear();
    for (let x = 0; x < 60; x++) { // grass bends with a slow gust
      const h = 2 + Math.floor(hash(x, 9) * 3), lean = noise(x * 0.1 - t * 0.4, 0) > 0.55 ? "/" : "|";
      for (let k = 0; k < h; k++) G.put(x, 17 - k, k === h - 1 ? (lean === "/" ? "," : "'") : lean);
    }
    for (const f of flies) {
      const x = f.x + 3 * Math.sin(t * 0.3 * f.sp + f.ph), y = f.y + 1.5 * Math.sin(t * 0.5 * f.sp + f.ph * 2);
      const b = Math.max(0, Math.sin(t * 1.3 * f.sp + f.ph)) ** 3;
      const ch = GLOW[Math.min(4, Math.round(b * 4))];
      if (ch !== " ") G.put(Math.round(x), Math.round(y), ch);
    }
    return G.text();
  };
}
```

### E. Type, UI & data (via "Other")
Grid sized to the content: big block-letter banners with a glint passing, split-flap boards that riffle, typewriter/scramble text, spinners, sparklines with `▁▂▃▄▅▆▇█`, gauges, terminal sessions. Put the user's own text in `options`. These pieces are mono and take the page's ink colour.

### F. Glint mark (via "Other") — only the user's own logo or wordmark
The mark is ASCII art in two layers: an `ART` string, and an `INK` string where each character is a palette index. A diagonal glint band crosses it every few seconds: compute `k = smooth falloff of |x + 0.9·y − at|`, turn solid glyphs into `/` where k > 0.55, and shift the colour index to a lighter tier. Never recreate third-party logos, brands, characters or mascots. Offer an original mark instead.

## Step 4 — Verify (do not skip)

Render with any headless Chromium, through Playwright or Puppeteer. Load `out.html?motion` and screenshot at 2–3 different times (wait 1 s, 4 s, 7 s), in both `colorScheme: 'dark'` and `'light'` for mono pieces. Look at each image. Fix the piece if any check fails:
- Each silhouette reads at thumbnail size. If it doesn't, lower its `floor` or add rim light.
- The key light is the brightest thing on screen, and its reflection or halo agrees with its position.
- No flat bands. If the sky looks banded, add haze or check `floor`.
- No grid-wide noise.
- Nothing visibly pops at the loop point.
- The console has no errors. Frame cost is under about 40 ms: time 30 rAF ticks in `page.evaluate`.

If no headless browser is available, say so when you deliver, and ask the user to open the page and tell you what looks wrong.

## Step 5 — Deliver

Deliver in the form chosen in Q3:
- **Standalone HTML:** a single file with everything inlined. Its head comment credits the technique: "technique after ascii.rest (MIT, @bas3line)".
- **Artifact:** publish the bundled page, where the agent supports it. Use any page-design guidance the agent has.
- **Snippet:** the kit plus the piece as one `<script type="module">`, and `mount(el, piece)` on a `<canvas>` for colour pieces or a `<pre>` for mono ones.

Finish with one line on the piece and what the user can tweak: the `options`, the palette, the speed.

## Quality bar

The bar for every piece: something a designer would keep on screen. Restraint matters more than effects: dark ground, one warm accent against cool tones, slow motion (clouds about 1–2 cells/s, swells under 1 Hz), every element lit by the same light, and edges given rim light rather than outlines. The page shows only the piece. It respects `prefers-reduced-motion` (the runtime shows a still first frame), pauses when off-screen, and sets `role="img"` with an aria-label taken from `meta.note`.
