import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kaihen.timsfun.com',
  output: 'static',
  trailingSlash: 'always',
  vite: { build: { chunkSizeWarningLimit: 2500 } },
});
