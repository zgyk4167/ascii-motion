# Third-party notices

The code in this repository is under the MIT License (`LICENSE`). Parts of it are adapted from another MIT-licensed project, listed here.

## ascii.rest

- Project: ascii.rest by bas3line
- Site: https://ascii.rest
- Source: https://github.com/bas3line/ascii
- License: MIT

What is adapted:

| In this repository | Adapted from |
|---|---|
| `mount()` in `scripts/ascii-kit.js`: the canvas and `<pre>` runtime, light and dark detection, the frame loop, and the pause when off-screen, when the tab is hidden, or under reduced motion | `src/mount.ts` |
| `halftone()` in `scripts/ascii-kit.js`: the `·•●` dot ramp, the 4×4 Bayer dither and the cached nearest-palette lookup | the halftone scene pieces in `src/pieces/` (for example `kyoto-dusk.ts`, `deep-reef.ts`, `storm-plains.ts`) |
| `hash()`, `noise()` and `fbm()` in `scripts/ascii-kit.js` | helpers that recur in the same scene pieces |
| The piece contract (`meta` plus a frame function that returns text) and the ideas behind the style families in `SKILL.md` | the project as a whole |

The four pieces in `examples/` were written for this skill. They are not copies of ascii.rest pieces.

The same notice is in the header of `scripts/ascii-kit.js`. Pages built with the skill include the kit, so they carry the notice too. Keep it when you share them.

Full license text:

```
MIT License

Copyright (c) 2026 bas3line (https://github.com/bas3line)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Fetched from https://raw.githubusercontent.com/bas3line/ascii/main/LICENSE on 2026-10-08 (upstream commit 4b101f4).
