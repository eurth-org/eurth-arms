# Roadmap

Arms is a coat-of-arms maker that follows the rules of heraldry, at arms.eurth.org: pick a shield, a field, an ordinary and charges, and it writes the blazon, checks the rule of tincture and draws the arms. Type a blazon and it draws that instead. It is door 1 of Eurth's 2026 advent calendar and opens on 10 December 2026 at 00:00 Europe/Brussels. It is Flagwright's sister tool and should feel like it.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

**15 November 2026.** Phase 1 is under way. Done, with tests (`npm test`, `npm run check`): steps 1 to 5 (tinctures, the model, writing the blazon, reading it back, the tincture check and its fixes). In progress: step 6, drawing: every module is written (`geometry`, `shapes`, `lines`, `layout`, `charges`, `modern`, `render`) and `npm run sheet` writes a contact sheet to `sheet/`, but the pictures have not been checked by eye yet and have no tests; step 7 (`describe.ts`) is written and untested; step 11, the guide: pages 1 to 4 of 8 are drafted and unreviewed, pages 5 to 8 (blazon, marshalling, cadency, designing) and the glossary (step 12) are not written, so `tests/content.test.ts` fails until they are. Next: check the contact sheet and fix the drawing, test it, then steps 8 to 10, then finish 11 and 12.

Waiting on others:

- **@eurth/style 1.0.1 is released** (1.0.0 and 1.0.1, on 14 November), so Phase 2 can start as soon as Phase 1 is done. Read its HANDBOOK.md and copy its starter template first.
- **@eurth/profile 1.0.0** is written but not tagged. Its `arms` section already holds what the brief asks for: `link`, `summary`, `updated`, `svg` (at most 512 KB) and `blazon` (at most 400 characters). Nothing to ask of Foundations.

Questions for Stijn (the plan assumes the first answer to each):

1. **The drawn charges.** The lion, eagle, fleur-de-lis and emu will be drawn here as SVG paths, by hand in code, and checked by eye on a contact sheet. If you have drawings, or want to draw them, they slot in as path data.
2. **The mock-up's Crest tab and "Add to country card" button.** The brief says v1 is the shield, so there is no Crest step; and Card opens on 24 December, so until then the button is the profile's "Save profile".
3. **Template nations.** Invented names, sharing the suite's example nations where they exist (Hesperwick, Vantmoor, Calderwyn, Hohenfels, Ostaril). No real Eurth nations unless they agree.

## Next

### Phase 1: the engine and the words (needs nothing from @eurth/style)

Plain TypeScript in `src/arms/`, tests in `tests/`, as Flagwright keeps its engine in `src/flag/`. Only TypeScript, Vitest and Font Awesome Free (for the modern charges' paths) are installed. Commit and push after each step.

1. **Tinctures** (`tinctures.ts`): the two metals (Or, argent), five colours (gules, azure, vert, sable, purpure) and two furs (ermine, vair), each with its name, its class and its paint. Paints start from the mock-up's and differ in lightness, so gules and vert can be told apart without their hue. "Proper" exists for one charge only (see step 6).
2. **Model** (`model.ts`): arms are data.
   - Shield shape: heater, French, Spanish, Polish, lozenge, roundel. A blazon never names the shield, so the shape travels in the link, not in the blazon.
   - Field: plain; divided (per pale, per fess, per bend, per bend sinister, per saltire, quarterly, per chevron, tierced per pale, per fess or per pall); or patterned (barry, paly, bendy, chequy, with the number of pieces).
   - One principal ordinary (pale, fess, bend, chevron, cross, saltire, pile), and beside it an optional chief and an optional bordure. Each has a tincture and a line: straight, engrailed, indented, wavy or embattled. Two-part divisions take a line too ("per fess wavy").
   - Charge groups: a charge, how many (one to six), how they are arranged (in pale, in fess, in bend, two and one, in cross, in saltire and so on), and a tincture. A group lies on the field (around the ordinary, "between"), on the ordinary, or on the chief.
   - Charges: mullet (five, six or eight points), crescent, roundel, annulet, fleur-de-lis, lion (rampant, passant), eagle (displayed), and the modern charges, each with a name the blazon can use ("an anchor", "a tower").
   - Everything that arrives from a link, a file or a typed blazon is checked and clamped; nothing is trusted.
3. **Writing the blazon** (`blazon.ts`): one function from arms to the blazon, in the conventional order (field, ordinary, charges, chief, bordure) and one fixed style: "Azure, a chevron Or between three mullets argent". Roundels take their own names (bezant, plate, torteau, hurt, pellet, pomme, golpe). Arrangements are left out where they are the default ("three mullets" is two and one). At most 400 characters, the profile's limit.
4. **Reading a blazon** (`parse.ts`): a parser for the same subset, forgiving about case, commas, "and", digits or words for numbers, spelling variants (chequy, checky) and "of the field", "of the first", "of the second". It returns the arms, or says which word it stopped at and what it expected, in plain words. The promise, tested: every blazon the writer can produce parses back to the same arms, for every template, every feature and a thousand random arms.
5. **The tincture check** (`check.ts`): every layer against what it lies on: ordinary on field, chief and bordure on field, charges on the field, the ordinary or the chief. Colour on colour and metal on metal are flagged; furs, "proper" and fields parted of a metal and a colour are let through, as heralds do. Each finding names the two layers in words and carries a fix: the nearest tincture of the other class that the shield doesn't already use, as a new design. Unit-tested rule by rule.
6. **Drawing** (`shapes.ts`, `lines.ts`, `charges.ts`, `modern.ts`, `render.ts`): one function from arms to an SVG string, with a title (the blazon) and a description.
   - The six shield outlines; fields, divisions and patterns clipped to them; ordinaries sized to the shield; lines of partition made by one function that runs a pattern along any edge.
   - Furs as patterns: ermine spots and vair bells.
   - Charges placed by arrangement inside the room the shield and the ordinary leave, so three mullets fit a lozenge as well as a heater.
   - Our own drawings as path data: mullet, crescent, roundel, annulet, fleur-de-lis, lion rampant, lion passant, eagle displayed. One colour each, details cut out.
   - Modern charges: about 80 Font Awesome Free solid icons picked for arms (anchor, tower, key, crown, ship, tree, sun), each one path.
   - The emu: "Or, an emu proper" parses and draws an emu in its own colours. It is not in the picker.
   - Only numbers, our own paths and tincture paints reach the markup. A tool script lays every charge, shape, line and template out on one contact sheet to check by eye.
7. **In plain words** (`describe.ts`): the arms described without heraldry's terms ("A blue shield with a gold chevron between three white five-pointed stars"), for Copy description, alternative text and the profile's summary.
8. **Simple mode and Random** (`simple.ts`, `random.ts`): Simple is four choices (shield, field, ordinary, charge) with their tinctures, each a preset; Advanced opens lines, the chief and bordure, charges on the ordinary and the chief, arrangements, attitudes and counts. Random makes arms that look like arms and always pass the tincture check, from a seed so it can be tested.
9. **Saving** (`link.ts`, `profile.ts`): the design in compact, versioned form for the link's query string, with defaults left out so a plain address is the default arms; `?blazon=…` is read as well, so a typed blazon can be shared as a link. The profile's `arms` section: `blazon`, `link`, `svg`, `summary` and `updated`, within the schema's limits; every other key is left alone.
10. **Templates** (`templates.ts`): 18 to 24 arms for fictional nations, each a name, a line on what the arms mean, a shield shape and a blazon. The blazon is the source: a test parses each one, writes it back and expects the same text, and expects the tincture check to pass.
11. **Guide** (`src/content/guide/`): eight pages, each with sources and a last-updated date, and every figure a blazon drawn by the engine (a test parses them all).
    - Tinctures and the rule of tincture, with the famous exceptions (Jerusalem's gold on silver)
    - Divisions and lines of partition
    - The ordinaries
    - Charges and their attitudes
    - How to read and write a blazon
    - Marshalling: impalement and quartering
    - Cadency: marks of difference
    - Designing arms for a fictional nation
    - Sources: Fox-Davies, *A Complete Guide to Heraldry* (1909); Parker, *A Glossary of Terms Used in Heraldry* (1894); Boutell's *Heraldry*; Friar, *A Dictionary of Heraldry*; Woodcock and Robinson, *The Oxford Guide to Heraldry*; Pastoureau, *Heraldry: Its Origins and Meaning*; the College of Arms and the Court of the Lord Lyon.
12. **Glossary** (`src/content/glossary.ts`): every term the maker and the guide use, about 80, each with an anchor and, where it helps, a small figure. A test fails if the maker's lists or the guide use a term the glossary lacks.

### Phase 2: the site (only once @eurth/style 1.0.0 is released)

13. Start from the starter template in eurth-style; read HANDBOOK.md first, and where it differs from this plan or from Flagwright, the handbook wins. Known differences from Flagwright already: the design lives in the query string, not after the `#`; nothing is saved in the browser; the shell, tokens and theme switch come from @eurth/style.
14. Pages: Maker, Guide (an index and the eight pages), Glossary, Templates, with titles ("Arms: free online coat-of-arms maker for worldbuilders"), descriptions, canonical links, JSON-LD (WebApplication, BreadcrumbList, DefinedTermSet, Organization), sitemap.xml, robots.txt, llms.txt and Open Graph images.
15. The maker, as a Svelte 5 island, laid out as the mock-up: steps on the left (Shield, Field, Ordinary, Charges), the shield, its blazon and "Or type a blazon" on the right. A toolbar with Random and Simple/Advanced, as on Flagwright. Tincture swatches that carry their names. The tincture check as a status line with a word and an icon ("Rule of tincture respected" or "Colour on colour: the chevron gules lies on azure") and a "Fix it" button. Undo and redo, kept in memory for the visit only.
16. Save and load: Copy link, and the profile file through @eurth/profile's buttons (file picker and drag and drop).
17. Exports: SVG, PNG and WebP from 320 to 3840px and in the handbook's sharing sizes, the blazon text, Copy picture, Copy description, and the Share dialog.
18. Delight: a charge settles onto the shield with a small drop (under half a second, nothing for reduced motion); the emu; the suite's own touches from @eurth/style.
19. Offline, install, security headers, contrast, axe and Lighthouse checks, as the handbook asks.
20. CI, and the launch workflow: `LAUNCH_AT` is `2026-12-10T00:00:00+01:00`, the scheduled run starts at 22:30 UTC on 9 December, and it also runs by hand. No custom domain and no workers.dev deploy before then.
21. README (use, development, deployment), docs/feedback-log.md, and the handbook's checklist. Done when that passes, every template's blazon parses back to the same arms, and the tincture check is unit-tested.

### After launch

- **The full achievement:** helm, crest, mantling, supporters and a motto scroll around the shield.
- **Hatching:** the arms in black and white with the engravers' lines and dots for each tincture, as a view and a download.
- **Marshalling in the maker:** impale or quarter two finished arms.
- **Cadency marks** as charges: the label, and the marks for younger sons.
- **More of everything:** bend sinister, pall and the diminutives (bars, pallets, bendlets); lines nebuly, dovetailed and raguly; more attitudes (lion passant guardant, sejant, eagle rising); more furs (ermines, erminois, pean, counter-vair); counterchanging.
- **Wiki-ready output:** an IIWiki snippet with the blazon and a symbolism section to fill in.
- **The link to Card,** once its door has opened.

## Releases

None yet.

## Not planned

- **Accounts, a gallery, or arms kept on a server.** Arms live in their link or the profile file; nothing is stored, in the browser either.
- **Real arms as templates.** Templates are arms of invented nations. Real arms belong to real people, cities and states, and in some countries bearing them is a matter of law.
- **Granting or registering arms.** Arms is for fiction. The guide says where real grants come from.
- **The whole of blazon.** The parser reads the subset the maker can draw, and says plainly what it doesn't know, rather than guessing at the rest.
- **AI-generated charges.** Every shape is drawn by code or by a person, as on Flagwright.
- **Lettering on the shield.** Mottoes belong on the scroll, which is on the list above.
- **Trackers and analytics.**
