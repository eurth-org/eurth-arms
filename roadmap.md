# Roadmap

Arms is a coat-of-arms maker that follows the rules of heraldry, at arms.eurth.org: pick a shield, a field, an ordinary and charges, and it writes the blazon, checks the rule of tincture and draws the arms. Type a blazon and it draws that instead. It is door 1 of Eurth's 2026 advent calendar and opens on 10 December 2026 at 00:00 Europe/Brussels. It is Flagwright's sister tool and should feel like it.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

**15 November 2026.** Phase 1 is finished, and Phase 2 has begun: the site is scaffolded from @eurth/style's starter (1.1.0), and the guide (an index and eight pages), the glossary, the templates and a start page without the maker are built and pass the handbook's suites (185 tests; `npm run check`, `npm run build`, `npm test`, in that order). **Next: Phase 2, step 15, the maker** (`src/ui/Maker.svelte`, to be placed on `src/pages/index.astro` above "How it works"). Astro 7 needs Node 22.23 or newer: on Stijn's machine that is `/opt/homebrew/bin/node` (26), which must come first on the PATH.

What a new session should know:

- **The engine is in `src/arms/`** and has no browser or framework in it. `armsSvg(arms)` draws, `blazon(arms)` writes, `parseBlazon(text)` reads, `checkTincture(arms)` checks, `describeArms(arms)` describes, `compact`/`expand` are the link, `toSection`/`fromSection` the profile, `randomSimple`/`fromSimple` Simple mode and Random. The README has the full map.
- **The lions and eagles are not ours.** On Stijn's word (14 November) they are heraldic art from Wikimedia Commons: Sodacan's lions (CC BY-SA 3.0) and two public-domain eagles, in fourteen attitudes. `art/commons/README.md` lists every file, author and licence; `NOTICE` says what is under which licence; `tools/beasts.py` converts them. This sets three jobs for the site, in Phase 2 below: the footer credit (`footerCredit` in `src/arms/credits.ts`), a notice beside the downloads when a design has a lion in it (`creditsFor(arms)`), and loading each beast's drawing only when it is needed (the fourteen drawings are about 450 KB of path data).
- **`npm run sheet`** writes a contact sheet of everything the engine draws to `sheet/` (not committed), for checking the drawing by eye.
- **The link format is frozen at version 1:** the order of the model's lists (shapes, lines, divisions, attitudes and so on) is part of it. Only ever add to their ends; a test holds them still.

Waiting on others:

- Nothing. @eurth/style 1.1.0 and @eurth/profile 1.0.0 are both released and installed. The profile's `arms` section already holds what the brief asks for; Arms adds one key of its own, `shape`, which the schema allows.

Answered by Stijn, or settled by the brief:

1. **The drawn charges:** the beasts come from Wikimedia Commons (above). The mullet, crescent, roundel, annulet, fleur-de-lis and the emu are drawn here.
2. **The mock-up's Crest tab and "Add to country card" button:** no Crest step in v1; the button is the profile's "Save profile" until Card's door opens on 24 December. (Assumed from the brief; say if not.)
3. **Template nations:** invented names, sharing the suite's example nations (Hesperwick, Vantmoor, Calderwyn, Hohenfels, Ostaril). (Assumed; say if not.)

## Next

### Phase 2: the site

Done so far: step 13 (the starter, renamed), and of step 14 every page but the maker's own part of the start page. The guide's Markdown is read by `src/lib/guide.ts`; every figure is a file under `/figures/`, made at build time (`src/lib/figures.ts`).

13. Start from the starter template in eurth-style; read HANDBOOK.md first, and where it differs from this plan or from Flagwright, the handbook wins. Known differences from Flagwright already: the design lives in the query string, not after the `#`; nothing is saved in the browser; the shell, tokens and theme switch come from @eurth/style.
14. Pages: Maker, Guide (an index and the eight pages), Glossary, Templates, with titles ("Arms: free online coat-of-arms maker for worldbuilders"), descriptions, canonical links, JSON-LD (WebApplication, BreadcrumbList, DefinedTermSet, Organization), sitemap.xml, robots.txt, llms.txt and Open Graph images.
15. The maker, as a Svelte 5 island (the beasts' drawings loaded one by one as they are needed, never all at once), laid out as the mock-up: steps on the left (Shield, Field, Ordinary, Charges), the shield, its blazon and "Or type a blazon" on the right. A toolbar with Random and Simple/Advanced, as on Flagwright. Tincture swatches that carry their names. The tincture check as a status line with a word and an icon ("Rule of tincture respected" or "Colour on colour: the chevron gules lies on azure") and a "Fix it" button. Undo and redo, kept in memory for the visit only.
16. Save and load: Copy link, and the profile file through @eurth/profile's buttons (file picker and drag and drop).
17. Exports: SVG, PNG and WebP from 320 to 3840px and in the handbook's sharing sizes, the blazon text, Copy picture, Copy description, and the Share dialog. Beside the download buttons, when the design has a lion in it: "This lion is by Sodacan (CC BY-SA 3.0). Credit Sodacan and share your picture on the same terms." The saved SVG already carries the credit; PNG and WebP can't, so the notice matters most there.
18. Delight: a charge settles onto the shield with a small drop (under half a second, nothing for reduced motion); the emu; the suite's own touches from @eurth/style.
19. Offline, install, security headers, contrast, axe and Lighthouse checks, as the handbook asks.
20. CI, and the launch workflow: `LAUNCH_AT` is `2026-12-10T00:00:00+01:00`, the scheduled run starts at 22:30 UTC on 9 December, and it also runs by hand. No custom domain and no workers.dev deploy before then.
21. The footer's credits: `footerCredit` from `src/arms/credits.ts` beside the handbook's own (Font Awesome, line-md), and a credits section on the guide's index naming every source in `art/commons/README.md`. README (use, development, deployment), docs/feedback-log.md, and the handbook's checklist. Done when that passes, every template's blazon parses back to the same arms, and the tincture check is unit-tested.

### After launch

- **The full achievement:** helm, crest, mantling, supporters and a motto scroll around the shield.
- **Hatching:** the arms in black and white with the engravers' lines and dots for each tincture, as a view and a download.
- **Marshalling in the maker:** impale or quarter two finished arms.
- **Cadency marks** as charges: the label, and the marks for younger sons.
- **More of everything:** bend sinister, pall and the diminutives (bars, pallets, bendlets); lines nebuly, dovetailed and raguly; more attitudes (regardant, eagle close and volant) and more beasts from Wikimedia Commons (griffin, stag, boar, horse, dragon); more furs (ermines, erminois, pean, counter-vair); counterchanging.
- **Wiki-ready output:** an IIWiki snippet with the blazon and a symbolism section to fill in.
- **The link to Card,** once its door has opened.

## 15 November 2026: the engine (not released; there is no site yet)

Phase 1 of the plan: everything that needs no page.

- **Tinctures:** two metals, five colours and two furs, painted flat, with azure in Eurth's blue and lightness set so that red and green, gold and green, and blue and purple can be told apart without their hue.
- **The model:** six shield shapes; plain, divided (ten ways) and patterned (four ways) fields; seven principal ordinaries with a chief and a bordure beside them; five lines of partition; charges on the field, on the ordinary and on the chief, one to six, in nine arrangements.
- **Charges:** mullet (five, six or eight points), crescent, roundel, annulet and fleur-de-lis drawn here; lions in twelve attitudes and eagles in two, from Wikimedia Commons; 99 modern charges from Font Awesome Free; and one emu.
- **The blazon, both ways:** written in the herald's order in one fixed style, and read back by a forgiving parser that says plainly, and where, what it can't read. Every blazon the writer can produce reads back to the same arms.
- **The rule of tincture:** every layer checked against what it lies on, each finding with a word, a sentence and a one-click fix.
- **Drawing:** one function from arms to SVG. Charges settle into the room the shield, the ordinary, the chief and the bordure leave them, so a design keeps working when the shield changes shape. Pictures that use a beast carry its author and licence.
- **In plain words:** a description of any arms without heraldry's terms.
- **Simple mode and Random:** arms in four choices; random arms that always respect the rule.
- **Saving:** a compact, versioned form for the link that says only what differs from the default arms; a typed blazon as a link; the profile's `arms` section, written and read back.
- **24 templates** for invented nations, each with its blazon as the source.
- **The guide,** eight pages with sources: tinctures, divisions, ordinaries, charges, blazon, marshalling, cadency, and designing arms for a fictional nation; every figure a blazon the engine draws.
- **The glossary:** 121 terms, 83 with a figure.
- **118 tests,** among them a thousand random arms through the writer and parser, the tincture check rule by rule, and every template's blazon read back word for word.

## Not planned

- **Accounts, a gallery, or arms kept on a server.** Arms live in their link or the profile file; nothing is stored, in the browser either.
- **Real arms as templates.** Templates are arms of invented nations. Real arms belong to real people, cities and states, and in some countries bearing them is a matter of law.
- **Granting or registering arms.** Arms is for fiction. The guide says where real grants come from.
- **The whole of blazon.** The parser reads the subset the maker can draw, and says plainly what it doesn't know, rather than guessing at the rest.
- **AI-generated charges.** Every shape is drawn by code or by a person, as on Flagwright. The lions and eagles are by heraldic artists, from Wikimedia Commons.
- **Art we may not pass on.** Only public-domain work and work whose licence allows re-use and changes (CC0, CC BY, CC BY-SA). Nothing marked non-commercial or no-derivatives, however good the lion.
- **Lettering on the shield.** Mottoes belong on the scroll, which is on the list above.
- **Trackers and analytics.**
