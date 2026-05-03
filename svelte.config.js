import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx', '.md'],
      smartypants: { dashes: 'oldschool' }
    })
  ],
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      strict: false,
      prerender: {
        concurrency: 4
      }
    }),
    alias: {
      $lib: 'src/lib'
    },
    serviceWorker: {
      register: true
    },
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // Warnen statt failen, damit verlinkte aber noch nicht implementierte
        // Phase-2/3-Routen den Build nicht blockieren.
        console.warn(`Prerender 404: ${path} (linked from ${referrer}) — ${message}`);
      }
    }
  }
};

export default config;
