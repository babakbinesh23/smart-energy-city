import { defineConfig } from 'vite';

// GitHub Pages serves a project repository under /smart-energy-city/.
// Local development remains available at the usual / path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/smart-energy-city/' : '/',
}));
