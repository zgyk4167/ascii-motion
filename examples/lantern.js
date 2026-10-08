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
