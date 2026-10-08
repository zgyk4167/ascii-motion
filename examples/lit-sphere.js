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
