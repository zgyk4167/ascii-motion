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
