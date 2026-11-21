import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/smart-energy-city/' : '/',
  build: { rollupOptions: { input: {
    portal: resolve(process.cwd(), 'index.html'),
    reference: resolve(process.cwd(), 'reference/index.html'),
  } } },
}));
