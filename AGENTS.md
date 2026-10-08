# AGENTS.md

This directory is an Agent Skill. The full instructions are in `SKILL.md`. Read it before you write anything.

Short version for agents that do not load skills:

- Ask the user three questions first: style, subject and delivery. `SKILL.md` lists the options. Use a question tool if you have one; otherwise ask in chat.
- Write one original piece file that follows the piece contract in `SKILL.md`. Do not copy ascii.rest pieces, and never recreate third-party logos, brands, characters or mascots.
- Bundle it: `python3 scripts/bundle.py scripts/ascii-kit.js <piece>.js <out>.html "<Title>"`. The result is one self-contained HTML file.
- Check it in a headless browser at 2 or 3 moments, as `SKILL.md` Step 4 describes, before you hand it over.
- Keep the license comment at the top of the kit. It travels into every page.
