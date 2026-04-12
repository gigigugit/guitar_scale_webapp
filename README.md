# Dragon Scales

This is a client-side Vite + React + Tailwind fretboard viewer.

## Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

## GitHub Pages

This repo is configured to deploy to GitHub Pages from the `main` branch using GitHub Actions.

Required GitHub setting:

1. Open the repository settings.
2. Go to `Pages`.
3. Set `Source` to `GitHub Actions`.

After that, every push to `main` will build and deploy the site.

For this repository, the expected Pages URL is:

`https://gigigugit.github.io/guitar_scale_webapp/`

## Features

- Key, scale, instrument, tuning, label mode, fret, and string controls
- SVG fretboard display optimized for the current view
- Copy and save actions for tablature output

