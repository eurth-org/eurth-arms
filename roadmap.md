# Roadmap

Arms is a coat-of-arms maker that follows the rules of heraldry, at arms.eurth.org: pick a shield, a field, an ordinary and charges, and it writes the blazon, checks the rule of tincture and draws the arms. Type a blazon and it draws that instead. It is door 1 of Eurth's 2026 advent calendar and opens on 10 December 2026 at 00:00 Europe/Brussels. It is Flagwright's sister tool and should feel like it.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

**15 November 2026.** Arms is built and waiting for its door. Everything in the brief is done: the engine, the maker, the guide, the glossary, the templates, the profile section, the exports, the drop and the emu. All of the handbook's checks pass on this machine: `npm run check`, `npm run build`, `npm test` (187 tests, among them the handbook's own suites on the built site), `npm run axe` (13 pages, both themes, no findings) and `npm run smoke`. CI on GitHub is green too, Lighthouse's marks included, and holds the deploy back until the door. The launch workflow is set for 22:30 UTC on 9 December and waits for `LAUNCH_AT`. **Next: the short list under "Before the door" below.** Astro 7 needs Node 22.23 or newer: on Stijn's machine that is `/opt/homebrew/bin/node` (26), which must come first on the PATH.

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

### Before the door (10 December 2026, 00:00 Europe/Brussels)

- **Stijn to look it over:** `npm run preview`, then http://localhost:8787. Above all the three things assumed rather than asked: no Crest step, "Save profile" in place of "Add to country card", and invented template nations.
- **Stijn to confirm the lions' licence is acceptable.** Sodacan's lions are CC BY-SA 3.0: pictures with a lion in them must credit Sodacan and be shared alike. Arms says so in the footer, beside the downloads, on the guide's front page and inside every saved SVG. If share-alike is unwanted, the alternative is public-domain lions, which exist on Wikimedia Commons in fewer attitudes and a rougher hand.
- **On the evening of 9 December,** check that the Launch workflow has started by 22:45 UTC; if not, start it by hand. After the launch, delete `.github/workflows/launch.yml`.

### After launch

- **A mark of its own** for the favicon and the home-screen icon (they are the Eurth yurt for now).
- **Wide beasts drawn larger:** three lions passant in pale are sized by the circle each must fit, and could fill more of the shield's width.
- **The full achievement:** helm, crest, mantling, supporters and a motto scroll around the shield.
- **Hatching:** the arms in black and white with the engravers' lines and dots for each tincture, as a view and a download.
- **Marshalling in the maker:** impale or quarter two finished arms.
- **Cadency marks** as charges: the label, and the marks for younger sons.
- **More of everything:** bend sinister, pall and the diminutives (bars, pallets, bendlets); lines nebuly, dovetailed and raguly; more attitudes (regardant, eagle close and volant) and more beasts from Wikimedia Commons (griffin, stag, boar, horse, dragon); more furs (ermines, erminois, pean, counter-vair); counterchanging.
- **Wiki-ready output:** an IIWiki snippet with the blazon and a symbolism section to fill in.
- **The link to Card,** once its door has opened.

## 15 November 2026: built, and waiting for its door (0.1.0)

The first version. It goes live on 10 December 2026.

**The site**

- **The maker:** Simple mode (a shield, a field, an ordinary, a charge) and Advanced mode (lines of partition, a chief and a bordure beside the ordinary, charges on the ordinary and on the chief, attitudes, points and arrangements); Random; undo, redo and start again.
- **The blazon, live:** written under the shield as the design changes, with a button to copy it; and a box to type one, which is drawn or answered with what couldn't be read.
- **The rule of tincture, live:** a status line with a word and an icon, each finding in a sentence with its own fix, and "Fix all".
- **Taking it away:** the design in the link (`?d=1.…`, or `?blazon=…` for a typed one); SVG, PNG and WebP from 320 to 3840 pixels wide and in the six sharing sizes; Copy link, Copy picture, Copy description and the Share dialog; the Eurth profile file, loaded and saved.
- **Credit where it is due:** a notice beside the downloads when a lion is in the picture, the footer's line, and a section on the guide's front page.
- **Pages for search engines and newcomers:** the maker with how-to and questions; the guide's front page and eight parts, each with sources and its date; the glossary; the templates. Structured data on each, a sitemap, `robots.txt`, `llms.txt`, and a sharing image.
- **Delight:** a newly placed charge settles onto the shield with a small drop (and a soft knock, once sound is on); "Or, an emu proper" draws an emu and gets a word from the herald.
- **The kit:** from @eurth/style's starter (1.1.0): the shared shell, tokens only, the strict Content-Security-Policy, the service worker, the web manifest, and the CI, nightly and launch workflows. The beasts' drawings are fetched one at a time, as a design first needs them; the 163 figures are files of their own, loaded as they scroll into view.

**The engine**

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
