# PWA and Settings Versioning

This app has two update-sensitive persistence layers:

1. The service worker cache in `public/sw.js`
2. The saved visual settings payload in local storage

## Service worker versioning

The service worker cache name is derived from the `appVersion` query parameter on the registered `sw.js` URL.

Current flow:

- `vite.config.js` exposes `__APP_VERSION__` from `package.json` `version`
- `src/main.jsx` registers `sw.js?appVersion=<package version>`
- `public/sw.js` reads that query parameter and builds `dragon-scales-shell-<version>`

### Rule for future updates

When shipping a deploy that should force browsers to pick up a fresh cached shell, bump the `version` field in `package.json`.

This includes changes to:

- service worker behavior
- cached shell files in `public/`
- app-shell HTML behavior that must refresh immediately in installed/PWA contexts
- changes where stale browser assets have caused users to miss an update

A patch bump is enough for normal cache invalidation, for example:

- `0.1.0` -> `0.1.1`

Do not manually edit a `CACHE_NAME` constant in `sw.js` anymore. The package version is the cache version source of truth.

## Visual settings storage versioning

Visual settings are stored under `dragon-scales:fretboard-visual-settings` using a versioned envelope.

Current flow:

- `serializeFretboardVisualSettings()` writes `{ version, settings }`
- `loadFretboardVisualSettings()` migrates or clears legacy payloads
- the current storage version lives in `FRETBOARD_VISUAL_SETTINGS_STORAGE_VERSION`

### Rule for future updates

If the shape or meaning of saved visual settings changes, bump `FRETBOARD_VISUAL_SETTINGS_STORAGE_VERSION` in `src/lib/fretboardVisualSettings.js` and add a migration path in `deserializeStoredFretboardVisualSettings()`.

Use these guidelines:

- If old saved data can be safely normalized forward, migrate and rewrite it.
- If old saved data would hide a new default or cause visibly stale UI, clear it and fall back to `DEFAULT_FRETBOARD_VISUAL_SETTINGS`.
- Add a focused test for the migration or invalidation behavior.

## Verification checklist after version-sensitive changes

- Run `npm run build`
- Open a browser with an existing installed/cached copy
- Confirm the app shows the new shell without requiring a manual cache clear
- Confirm saved theme/settings behavior is either preserved correctly or intentionally reset
