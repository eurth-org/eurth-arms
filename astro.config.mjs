// @ts-check
import svelte from '@astrojs/svelte';
import eurth from '@eurth/style/astro';
import { defineConfig } from 'astro/config';
import { site } from './eurth.config.mjs';

// eurth(site) sets the site up as the handbook asks (static output, addresses ending in a
// slash, the stylesheet inside each page, scripts as separate files, a sitemap) and after the
// build writes the security headers, the service worker, the web manifest, robots.txt and llms.txt.
export default defineConfig({
  // The figures (some 160 pictures, most of the site's weight) are fetched when a page shows
  // them, not all at once on the first visit.
  integrations: [svelte(), eurth(site, { offlineSkip: [/^figures\//] })],
});
