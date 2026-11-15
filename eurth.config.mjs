// What this tool is called and where it lives. Read at build time only: astro.config.mjs, the
// frontmatter of .astro pages, tests and tools/. Never import this from a Svelte component or a
// <script>: it pulls in the list of every Eurth tool, and browser code must not carry that
// (HANDBOOK.md, Launch). Hand the component what it needs as props instead.
import { defineSite } from '@eurth/style/build';

export const site = defineSite({
  // The subdomain, and the tool's id in @eurth/style's tools.json.
  id: 'arms',
  name: 'Arms',
  url: 'https://arms.eurth.org',
  // "<Name>: free online <thing> maker for worldbuilders"
  title: 'Arms: free online coat-of-arms maker for worldbuilders',
  description: 'A free online coat-of-arms maker that follows the rules of heraldry: build a shield, get its blazon, or type a blazon and watch it drawn. No account needed.',
  tagline: 'Coats of arms that follow the rules',
  pages: [
    { href: '/', label: 'Maker' },
    { href: '/templates/', label: 'Templates' },
    { href: '/guide/', label: 'Guide' },
    { href: '/glossary/', label: 'Glossary' },
  ],
  repo: 'https://github.com/eurth-org/eurth-arms',
  ogAlt: 'Arms, the coat-of-arms maker at arms.eurth.org: the Eurth yurt beside a blue shield with a gold chevron between three white stars.',
});
