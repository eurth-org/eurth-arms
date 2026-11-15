import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,ts}'],
    // Every beast's drawing, ready before any test draws one.
    setupFiles: ['tests/setup.ts'],
  },
});
