# Dragon Scales

This is a client-side Vite + React + Tailwind fretboard viewer.

## Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To make the app available on your local network:

```bash
npm run dev:lan
```

Open the `Network` URL printed by Vite from another device on the same network.

## Build for production

```bash
npm run build
npm run preview
```

`npm run build` now produces a root-hosted build for normal local preview or generic static hosting.

## GitHub Pages

This repo is configured to deploy to GitHub Pages from the `main` branch using GitHub Actions.

The workflow sets `GITHUB_PAGES=true` during the Vite build, so the deployed site automatically uses the repository subpath base on Pages while local builds stay root-based.

Required GitHub setting:

1. Open the repository settings.
2. Go to `Pages`.
3. Set `Source` to `GitHub Actions`.

After that, every push to `main` will build and deploy the site.

For this repository, the expected Pages URL is:

`https://gigigugit.github.io/guitar_scale_webapp/`

## PWA and cache updates

The app uses versioned service worker caching so installed or previously loaded copies can pick up fresh shell files when the package version changes.

When you make a release that should invalidate cached assets, bump the `version` field in `package.json` and review [docs/pwa-versioning.md](docs/pwa-versioning.md) for the expected update flow.

## Install on mobile

For a fullscreen-like mobile experience, install the app to your home screen.

- On iPhone or iPad in Safari: tap `Share` -> `Add to Home Screen`.
- On Android browsers that support install: use the browser menu and choose `Install app` or `Add to Home screen`.

The mobile app is configured for standalone launch and landscape orientation.

## Features

- Key, scale, instrument, tuning, label mode, fret, and string controls
- In-key chord mode that derives chord options from the selected key and scale for the active instrument tuning
- Common alternate tunings for guitar and banjo, including dropped, open, modal, and lowered presets
- SVG fretboard display optimized for the current view
- Copy and save actions for tablature output

## Extending chord support

See [docs/in-key-chord-authoring.md](docs/in-key-chord-authoring.md) for the tuning schema and the chord-generation workflow used when adding new instruments or tunings.

## Scripts

- `npm run dev` starts the local Vite dev server.
- `npm run dev:lan` exposes the dev server on the local network.
- `npm run build` creates the production build.
- `npm run preview` serves the production build locally.
- `npm test` runs the Node test suite.

