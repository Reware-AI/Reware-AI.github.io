// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
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
  // Enable content collections
  content: {
    // Ensure content collections are properly registered
    collections: {
      blog: {
        type: 'content',
        directory: 'src/content/blog',
      },
    },
  },
});
