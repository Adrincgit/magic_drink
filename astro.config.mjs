import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// https://astro.build/config
export default defineConfig({
  site: 'https://Adrinc.github.io',
  // Resolve localhost and direct IPv4 requests to the same development server.
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
  integrations: [
    tailwind(),
    react(),
    {
      name: 'isolated-vite-cache',
      hooks: {
        'astro:config:setup': ({ command, updateConfig }) => {
          // Build/sync must not replace dependencies used by an open dev page.
          updateConfig({ vite: { cacheDir: `node_modules/.vite-magicdrink/${command}` } });
        },
      },
    },
  ],
  vite: {
    server: {
      strictPort: true,
      watch: { ignored: ['**/context/**', '**/tests/results/**', '**/dist/**'] },
    },
    optimizeDeps: {
      include: ['framer-motion', '@nanostores/react', 'nanostores', 'react-router-dom', 'gsap', 'three'],
    },
  },
});
