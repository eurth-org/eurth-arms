You're building Arms (arms.eurth.org), a coat-of-arms maker that follows the rules of heraldry, one of Eurth's free worldbuilding tools. Eurth (eurth.org) is a worldbuilding and roleplay community since 2004. The attached repo is eurth-org/eurth-arms.

Working order (Foundations and many other tools are being built at the same time tonight):
1. Save this brief as CLAUDE.md.
2. If the repo named above doesn't exist on GitHub yet, create it as a public, empty repo in eurth-org with the gh CLI and connect this folder; if you can't, ask me.
3. Read what already exists of github.com/eurth-org/eurth-style (HANDBOOK.md) and github.com/eurth-org/eurth-profile; they may still be in progress. Write the plan and show it to me.
4. Build the tool's core logic as plain TypeScript modules with thorough tests, and its content and data (guide text, presets, examples, data snapshots). None of that needs eurth-style.
5. Only once @eurth/style 1.0.0 is released (check the releases of github.com/eurth-org/eurth-style), start the site from its starter template and carry on to the end of this brief. Until then, don't scaffold the site, pages or styles.
6. Commit and push after every finished step, and keep roadmap.md up to date with exactly where to pick up, so a new session can continue if this one stops.

Background for every step: Read HANDBOOK.md in github.com/eurth-org/eurth-style and start from its starter template; read the profile schema in github.com/eurth-org/eurth-profile; study github.com/eurth-org/eurth-flag (Flagwright) closely, because Arms is its sister tool and should feel like it. The handbook wins over this brief on everything shared. Then write a plan and show it to me before you build.

Mock-up: the "arms.eurth.org, coat-of-arms maker" board on https://claude.ai/artifact/32RKDdVTtCfHsL6Qc6LxV6.

Pages: Maker, Guide, Glossary, Templates (as Flagwright has).

The maker, v1
- Shield shapes: heater, French, Spanish, Polish, lozenge, roundel.
- Field: plain, divided (per pale, per fess, per bend, per bend sinister, per saltire, quarterly, per chevron, tierced), or patterned (barry, paly, bendy, chequy).
- Ordinaries: chief, pale, fess, bend, chevron, cross, saltire, bordure, pile; with lines of partition (straight, engrailed, indented, wavy, embattled).
- Charges: mullet, crescent, roundel, annulet, fleur-de-lis, lion and eagle drawn as heraldic SVG of our own, plus Font Awesome Free shapes as "modern charges"; number and arrangement (1, 2, 3 in pale or 2 and 1, and so on).
- Tinctures: Or, Argent, Gules, Azure, Vert, Sable, Purpure, plus ermine and vair; each swatch carries its name.
- Rule-of-tincture check (colour on colour, metal on metal), shown with a word and an icon, with a one-click fix.
- The blazon: written live from the design, copyable, and a parser for the same subset so a typed blazon draws the arms.
- Simple and Advanced modes and a Random button, as on Flagwright.
- v1 is the shield. Helm, crest, mantling, supporters and motto scroll go on the roadmap.

Guide: Flagwright's vexillology guide is the model. Cover tinctures and the rule of tincture, divisions and lines of partition, ordinaries, charges and their attitudes, how to read and write a blazon, marshalling (impalement, quartering), cadency, and designing arms for a fictional nation. Sources and a last-updated date on every guide page.

Glossary: every term the maker and the guide use, each with an anchor.

Templates: 18 to 24 example arms for fictional nations, each loading into the maker.

Profile section "arms": blazon, the design's link state, and the SVG. Load and save the profile file.

Exports: SVG, PNG and WebP (320 to 3840px), the blazon text, Copy picture, Copy description.

Signature touch: a charge settles onto the shield with a small drop. Easter egg: the blazon "Or, an emu proper" draws an emu.

Done when the handbook's checklist passes, every template's blazon parses back to the same arms, and the tincture check is unit-tested.
