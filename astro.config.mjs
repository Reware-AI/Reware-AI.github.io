// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      theme: 'one-dark-pro',
      // Add custom languages
      langs: [],
      // Enable word wrap for better mobile experience
      wrap: true,
    },
    // Options for setting up HTML rendered from markdown
    syntaxHighlight: 'shiki',
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
