import { defineConfig } from 'vitest/config';

// `npm run sheet`: runs tools/sheet.ts, which writes the contact sheet to sheet/index.html.
export default defineConfig({
  test: {
    include: ['tools/sheet.ts'],
    setupFiles: ['tests/setup.ts'],
  },
});
