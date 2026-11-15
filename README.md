# Arms

> A friendly note: Arms is part of Eurth's advent calendar, and its door opens on 10 December 2026. The code is public, the site isn't yet. Please don't spoil the surprise before the door opens.

Arms is a coat-of-arms maker that follows the rules of heraldry: it draws the shield, writes the blazon, reads a blazon you type, and tells you when you've put colour on colour. It is one of the free worldbuilding tools by [Eurth](https://eurth.org), a worldbuilding and roleplay community since 2004, and will live at arms.eurth.org. It is the sister tool of [Flagwright](https://flag.eurth.org).

Status: built, and waiting for its door. The engine, the maker, the guide, the glossary and the templates are written and tested; the last checks before launch are listed in the roadmap. What's next, what each stage added and what's not planned is in the [roadmap](roadmap.md).

## How it works

- Arms are data: a shield shape, a field, an ordinary, a chief, a bordure and up to three groups of charges. Everything else is a function of that data.
- The engine in `src/arms/` is plain TypeScript with no browser or framework in it. One function draws arms as SVG text; one writes the blazon; one reads a blazon back. The site, when it is built, will use the same functions for the maker, the downloads, the template and guide pages and the tests.
- Nothing is stored. A design lives in its link, or in the Eurth profile file you save yourself.

## Where things live

| What | Where |
| --- | --- |
| The tinctures: names, classes, paints | `src/arms/tinctures.ts` |
| The model: shapes, fields, ordinaries, lines, charges, and cleaning whatever arrives | `src/arms/model.ts` |
| The charges by name (ours, the modern ones, and one emu) | `src/arms/catalogue.ts` |
| Writing a blazon | `src/arms/blazon.ts` |
| Reading a blazon | `src/arms/parse.ts` |
| The rule of tincture, and its one-click fixes | `src/arms/check.ts` |
| Shield outlines | `src/arms/shapes.ts` |
| Lines of partition | `src/arms/lines.ts` |
| Where ordinaries and charges go | `src/arms/layout.ts` |
| Our own charges, as path data | `src/arms/charges.ts` |
| The modern charges (Font Awesome Free icons) | `src/arms/modern.ts` |
| The lions and eagles (generated; see Credits) | `src/arms/beasts/` |
| Drawing arms as SVG | `src/arms/render.ts` |
| Arms in plain words | `src/arms/describe.ts` |
| Simple mode's presets, and Random | `src/arms/simple.ts`, `src/arms/random.ts` |
| The link's compact form | `src/arms/link.ts` |
| The Eurth profile's `arms` section | `src/arms/profile.ts` |
| The templates | `src/arms/templates.ts` |
| Who drew what, for the footer | `src/arms/credits.ts` |
| The guide (eight pages) and the glossary | `src/content/` |
| The maker: modes, history, link, typing a blazon, downloads, profile | `src/ui/Maker.svelte` |
| Its parts: tincture swatches, one group of charges | `src/ui/Swatches.svelte`, `src/ui/GroupEditor.svelte` |
| Reading the guide's Markdown; the figure files | `src/lib/guide.ts`, `src/lib/figures.ts` |
| Pages: maker, guide, glossary, templates, 404, figures | `src/pages/` |
| What the tool is called and where it lives | `eurth.config.mjs` |
| Tests | `tests/` |

## Adding to it

- **A modern charge:** a line in `src/arms/catalogue.ts` with its name, plural and Font Awesome icon, and the icon's import in `src/arms/modern.ts`. A test fails until both agree, and until the glossary and guide still read correctly.
- **A beast, or an attitude:** see `art/commons/README.md`. Only public-domain art or art whose licence allows re-use and changes.
- **A template:** add it to `src/arms/templates.ts` with its blazon. A test reads the blazon back and expects the same words, and expects the rule of tincture to be respected.
- **A glossary term:** add it to `src/content/glossary.ts`, in any order. Figures are blazons, written exactly as the maker writes them.
- **Anything in the model's lists** (shapes, lines, divisions, attitudes): add to the end, never the middle. Their order is part of the link format.

## Local development

Astro 7 needs Node 22.23 or newer.

```bash
npm install
npm run dev      # dev server on http://localhost:4321
npm run check    # Astro and TypeScript checks
npm run build    # static build into dist/, with the headers, the service worker and the figures
npm test         # unit tests, and after a build the handbook's checks of the built site
npm run preview  # the built site as Cloudflare serves it, on http://localhost:8787
npm run axe      # accessibility checks of the built site (needs Google Chrome)
npm run smoke    # the built site in a real browser (needs Google Chrome)
npm run sheet    # writes sheet/index.html: everything the engine draws, to check by eye
python3 tools/beasts.py   # remakes src/arms/beasts/ from art/commons/
```

## Deployment

The site runs as the `eurth-arms` Worker (static assets only) on the Cloudflare account that holds the eurth.org zone. The custom domain in `wrangler.jsonc` owns the `arms.eurth.org` DNS record, so the first deploy is what makes the site exist.

- **Before the door** (10 December 2026, 00:00 Europe/Brussels): pushes to `main` are checked, built and tested by GitHub Actions (`.github/workflows/ci.yml`) and not deployed. Preview locally with `npm run preview`.
- **The door:** `.github/workflows/launch.yml` starts at 22:30 UTC on 9 December, builds the site as it will be at the door's time, waits for the time in `LAUNCH_AT` and deploys. If it hasn't started by 22:45 UTC, start it by hand. Delete the file once the site is live.
- **After:** every green push to `main` deploys, and `.github/workflows/nightly.yml` rebuilds each night so the menus gain each newly opened door and new releases of @eurth/style arrive.

Deploying uses the organisation's `CLOUDFLARE_API_TOKEN` secret; without it the deploy step is skipped with a warning.

## Releasing

1. In the same commits as the work, update [roadmap.md](roadmap.md): move finished items out of Next, and add or extend the release's dated section.
2. Run `npm run check`, `npm run build`, `npm test`, `npm run axe` and `npm run smoke`.
3. Bump the version in `package.json`, merge to `main`, and tag it.

## Credits

- Lions by [Sodacan](https://commons.wikimedia.org/wiki/User:Sodacan), from Wikimedia Commons, under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), recoloured. Pictures made with a lion in them carry that licence: credit Sodacan and share them on the same terms. Arms writes the credit into every picture it saves.
- Eagles from Wikimedia Commons, in the public domain: displayed by Madboy74, rising after Arthur Charles Fox-Davies, *A Complete Guide to Heraldry* (1909).
- Modern charges by [Font Awesome](https://fontawesome.com) Free (CC BY 4.0).
- Every file, author and licence is listed in [art/commons/README.md](art/commons/README.md) and summed up in [NOTICE](NOTICE).
- The guide's sources are named on each of its pages.

## Licence

The code is Apache 2.0, see [LICENSE](LICENSE). The art listed under Credits keeps its own licences, see [NOTICE](NOTICE).
