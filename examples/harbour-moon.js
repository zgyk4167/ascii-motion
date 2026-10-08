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
