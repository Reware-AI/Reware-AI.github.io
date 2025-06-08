# RewareAI Website

A static website for RewareAI built with Astro and deployed to GitHub Pages.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   ├── favicon.png
│   ├── blog-images/
│   └── scripts/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🚀 Deployment

This website is automatically deployed to GitHub Pages using GitHub Actions. The deployment workflow is triggered on every push to the `main` branch.

### Manual Deployment

1. Build the project: `npm run build`
2. The built files will be in the `dist/` directory
3. GitHub Actions will automatically deploy to GitHub Pages

### Custom Domain

The website is configured to use the custom domain `rewareai.com` as specified in the `CNAME` file.

## 📞 Contact

For questions or support, please email: ho.hajipour@gmail.com

## 👀 Want to learn more?

Feel free to check [Astro documentation](https://docs.astro.build) for more information about the framework.
