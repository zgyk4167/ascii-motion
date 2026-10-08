# ascii-motion

Small moving pictures made of text, for a web page: a moon over a bay drawn in coloured dots, a sphere shaded in type under a circling light, a paper lantern swaying on its cord, a firefly meadow at night.

You tell your agent what you would like to see. The skill has the agent ask three short questions, write a new piece, check it in a headless browser, and give you one HTML file. The file has no dependencies and loads nothing from the network. It plays only while it is on screen, and it holds a still first frame for people who prefer reduced motion.

This is an Agent Skill in the open [Agent Skills](https://agentskills.io/specification) format. Technique inspired by ascii.rest (bas3line/ascii, MIT), and the runtime is adapted from its code. See [Credit](#credit).

## Demo

https://github.com/user-attachments/assets/d6894e90-7da2-44d0-9bcc-95a18e6c6bee

*Pink cosmos swaying in a morning breeze, drawn in coloured dots.*

Made with ascii-motion. Piece: morning cosmos, a 12-second loop.\
No third-party footage: every frame is rendered from the piece's own code.\
Technique after [ascii.rest](https://ascii.rest) by bas3line (MIT).

## What you can make

| Style | What it looks like | Good for | Example |
|---|---|---|---|
| Halftone scene | A full-colour landscape in dots of four sizes (` ·•●`), lit by one light: a moon, a lamp, the sun | A quiet page header, a banner, something to leave on screen | `examples/harbour-moon.js` |
| Shaded mono | One ink colour and a ramp of characters (`.,-~:;=!*#$@`) that shade a lit 3D form or a mathematical field | Text-first sites, terminal looks, loading screens. It follows the page's light or dark theme | `examples/lit-sphere.js` |
| Line sprite | A drawing made of strokes like `/ \ _ ( )`, with timed poses: a creature or an object that blinks, breathes or sways | A small companion in a corner, a 404 page, an about page | `examples/lantern.js` |
| Particles and sim | Many small marks moving by simple rules: firefly lights, rain, sparks | Backgrounds and ambience | `examples/firefly-meadow.js` |
| Type, UI and data | Block-letter banners with a passing glint, split-flap boards, typewriter text, spinners, sparklines, with your own text | Titles, status panels, small dashboards | none yet |
| Glint mark | Your own logo or wordmark in characters, with a band of light that crosses it | A brand mark you own. The skill will not recreate third-party logos | none yet |

## Try the examples without an agent

You need Python 3 and a browser.

```bash
python3 scripts/bundle.py scripts/ascii-kit.js examples/harbour-moon.js harbour-moon.html "Harbour moon"
```

Open `harbour-moon.html` in your browser. If your system is set to reduce motion, the page shows a still frame; add `?motion` to the end of the URL to play it anyway.

## Ask your agent

Once the skill is installed (see below), ask in your own words. For example:

- "Make an ASCII animation of a mountain lake at dawn, with mist moving over the water."
- "I want a small line-drawn cat for the corner of my 404 page. It should blink now and then."
- "Draw a shaded ASCII torus that turns slowly, for my site header. One colour, works in light and dark mode."

The skill has the agent ask you:

1. **Style**: one of the families above.
2. **Subject**: three or four ideas that fit the style, each with its light and its one motion.
3. **Delivery**: a standalone HTML file (the default), a published page where your agent can publish one, or a snippet for your own site.

## What you get

- **A standalone HTML file.** Open it in any modern browser. It works offline.
- **On a website.** Upload the file and link to it, or embed it with an `<iframe>`. If you chose the snippet, paste the `<script type="module">` into your page next to a `<canvas>` (colour pieces) or a `<pre>` (one-ink pieces).
- **As a video or GIF.** The skill does not record. Open the file with `?motion` and use any screen recorder.

To change a piece later, ask the agent to adjust its palette, speed or options, or edit the values near the top of the piece yourself.

## Measured

On 2026-10-08, the four examples were bundled and rendered in headless Chrome 154 on Linux. Every page animated, logged no console errors and made no network requests besides loading itself. The bundled files are 11.8 to 14.6 KB. In Node 20, one frame of the 200×100 halftone scene took about 9.8 ms to compute, and each of the smaller pieces took under 0.2 ms. Times depend on the machine.

That test covers the scripts and their output. It is not a test of the agents listed below.

## Use with your agent

Copy or clone this folder, named `ascii-motion`, into one of the skill directories your agent loads:

| Agent | Project directory | Personal directory | Source |
|---|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | [docs](https://docs.claude.com/en/docs/claude-code/skills) |
| OpenAI Codex | `.agents/skills/` | `~/.agents/skills/` | [docs](https://developers.openai.com/codex/skills) |
| Cursor | `.agents/skills/` or `.cursor/skills/` | `~/.agents/skills/` or `~/.cursor/skills/` | [docs](https://cursor.com/docs/context/skills) |
| Gemini CLI | `.agents/skills/` or `.gemini/skills/` | `~/.agents/skills/` or `~/.gemini/skills/` | [docs](https://geminicli.com/docs/cli/skills/) |
| GitHub Copilot (cloud agent, CLI, VS Code and JetBrains agent mode) | `.github/skills/`, `.claude/skills/` or `.agents/skills/` | `~/.copilot/skills/` or `~/.agents/skills/` | [docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) |

Cursor also reads `.claude/skills/` and `~/.claude/skills/`. One copy in `~/.agents/skills/` therefore covers Codex, Cursor, Gemini CLI and Copilot, and one in `~/.claude/skills/` covers Claude Code and Cursor.

All of these can load the skill. It needs an agent that can write files and run `python3`. A headless Chromium (through Playwright or Puppeteer) lets the agent check its work. Without one, `SKILL.md` tells the agent to say so and ask you to look. It also tells the agent to use its question tool for the three questions if it has one, and otherwise to ask in chat.

For an agent without skill support, point it at [`AGENTS.md`](AGENTS.md) or `SKILL.md`.

## Responsible use

- The skill writes new pieces. It does not copy ascii.rest pieces, and it will not recreate third-party logos, brands, characters or mascots.
- The glint mark is for marks you own or have the right to use.

## Credit

The approach comes from [ascii.rest](https://ascii.rest) by bas3line ([source](https://github.com/bas3line/ascii), MIT). Each piece is a function of time that returns a block of text, with an optional colour per character, and a small runtime plays it. The runtime and the halftone, hash and noise helpers in `scripts/ascii-kit.js` are adapted from ascii.rest's code. The four examples were written for this skill.

## License

Code: MIT, see [`LICENSE`](LICENSE). Parts adapted from ascii.rest are under its MIT license, Copyright (c) 2026 bas3line; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). Pages built with the skill include that notice in a code comment. Keep it when you share them.
