import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { rallyPwa } from './scripts/vite-plugin-pwa.ts';

export default defineConfig({
  plugins: [preact(), rallyPwa()],
  build: { target: 'es2022', cssCodeSplit: false },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
