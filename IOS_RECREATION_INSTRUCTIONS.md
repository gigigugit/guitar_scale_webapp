# Dragon Scales iOS Re-Creation Instructions

## 1. Objective

Re-create the current `guitar_scale_webapp` as a true iOS application while preserving the existing product behavior:

- landscape-first fretboard viewer
- fast scale/key/instrument switching
- graphic fretboard as the primary output
- themeable visual system
- offline-capable feel
- export/share support for fretboard output

This document describes the current codebase, the logic that must be preserved, and the recommended structure for a native rebuild.

---

## 2. Current technology snapshot

### Runtime stack

- **Vite 5**
- **React 18**
- **Tailwind CSS 3**
- **Plain JavaScript / JSX**
- **SVG rendering** for the fretboard
- **PWA shell** via `manifest.webmanifest` and `public/sw.js`

### Build commands

```bash
npm install
npm run dev
npm run build
```

### Deployment assumptions

- `vite.config.js` sets `base` to `/guitar_scale_webapp/` for production builds
- app is currently designed for GitHub Pages hosting
- service worker caches the app shell and same-origin static assets

---

## 3. Repository structure

### Root

- `package.json` - build/runtime dependencies and scripts
- `vite.config.js` - Vite config, production base path
- `tailwind.config.js` - design token extension
- `public/manifest.webmanifest` - install metadata, standalone display, landscape orientation
- `public/sw.js` - cache-first service worker
- `README.md` - local setup and PWA install notes

### Application entry

- `src/main.jsx`
  - mounts React
  - registers service worker in production
  - emits custom PWA lifecycle events

- `src/App.jsx`
  - app shell wrapper
  - global background, text color, safe-area padding
  - renders `FretboardApp`

### Main feature container

- `src/apps/FretboardApp.jsx`
  - central app state
  - device/orientation detection
  - PWA install/update/offline banners
  - visual settings persistence
  - string spacing persistence
  - tablature copy/save
  - SVG export
  - assembles viewer, caption controls, and bottom sheet

### Domain/model logic

- `src/lib/fretboard.js`
  - note constants
  - scale interval definitions
  - instrument and tuning definitions
  - bounded integer helpers
  - fretboard model generation
  - tablature string rendering

- `src/lib/fretboardVisualSettings.js`
  - theme presets
  - visual setting field metadata
  - defaults and normalization
  - responsive scaling rules for smartphones
  - CSS variable mapping
  - localStorage hydration/persistence helpers

### UI components

- `OutputPanel.jsx` - graphic fretboard frame and draggable tuning overlay
- `GraphicFretboard.jsx` - raw SVG board rendering and metrics
- `ControlsPanel.jsx` - full control sheet
- `FretboardCaptionSelectors.jsx` - compact inline selectors below board
- `BottomControlsSheet.jsx` - collapsible bottom drawer with tabs
- `ThemePickerPanel.jsx` - preset theme chooser
- `VisualTweaksPanel.jsx` - advanced manual visual controls
- `HeroHeader.jsx` - title
- `ControlLayoutMockup.jsx` - concept/mockup panels

---

## 4. Core product behavior that must be preserved

### Musical controls

The app currently supports:

- **Keys:** `C, C#, D, E♭, E, F, F#, G, G#, A, B♭, B`
- **Scales:** Major, Minor, Pentatonic Major, Pentatonic Minor
- **Instruments:** Guitar, Banjo
- **Tunings:**
  - Guitar: Standard, Drop D, Open G
  - Banjo: Standard with 5th-string `nutFret = 5`
- **Display modes:** Fret Number, Note, Interval
- **Fret window:** start/end fret, currently capped at 18 in the app state
- **Interval visibility:** per-degree toggles

### Rendering outputs

The app produces two logical outputs from the same model:

1. **Graphic fretboard**
   - SVG-based
   - responsive
   - themeable
   - supports open-string lane
   - supports local nuts for shortened strings

2. **Tablature text output**
   - generated in `renderTablature`
   - used for copy/save export

### Mobile behavior

- landscape-first smartphone experience
- portrait gate on phones
- safe-area aware layout
- collapsible bottom control drawer
- compact caption controls under the board

### Offline/PWA behavior to translate conceptually

Web implementation uses:

- service worker install/update flow
- install prompt banner
- offline-ready banner
- update-available banner

For native iOS, these become:

- bundled offline assets
- no service worker dependency
- replace install/update banners with native first-run/update messaging only if needed

---

## 5. Domain model to recreate

Create a shared native model layer first.

### Notes

Use the exact chromatic order:

`["C", "C#", "D", "E♭", "E", "F", "F#", "G", "G#", "A", "B♭", "B"]`

### Scales

```text
Major:             [0, 2, 4, 5, 7, 9, 11]
Minor:             [0, 2, 3, 5, 7, 8, 10]
Pentatonic Major:  [0, 2, 4, 7, 9]
Pentatonic Minor:  [0, 3, 5, 7, 10]
```

### Instruments and tunings

Represent each string as:

- display label
- open note
- nut fret

This is required because banjo has a shortened string.

### Fretboard model fields

Your native `FretboardModel` should at minimum contain:

- selected key
- scale name
- instrument
- tuning name
- display mode
- start fret
- end fret
- visible string indices
- scale notes
- active note set
- degree map
- fret list
- visible strings
- note cells per string
- fret markers
- header text
- show-open-strings flag

### Note cell fields

Each rendered note cell should include:

- fret
- note
- active flag
- display value

---

## 6. Rendering algorithm to preserve exactly

### Scale note generation

1. Find the selected key index in the chromatic note array.
2. Apply scale intervals modulo 12.
3. Build the ordered scale note list.

### Degree map

Map scale notes to interval labels:

`["1", "2", "3", "4", "5", "6", "7"]`

### Active-note filtering

Use the interval checkbox state to create a set of visible notes.

### String rendering

For each visible string:

1. Determine the string open note index.
2. Skip frets below `nutFret`.
3. For each visible fret:
   - compute relative fret
   - compute note modulo 12
   - mark active if the note is in the selected-note set
   - compute label based on display mode

### Display mode rules

- **Fret Number** -> show visible fret number
- **Note** -> show note symbol
- **Interval** -> show mapped scale degree

### Open string lane rule

Show the open-string lane only when:

- `startFret === 0`
- at least one visible string has `nutFret === 0`

### Tablature generation

Preserve the existing text export behavior:

- header line
- fret marker line
- divider line
- one line per string
- inactive cells displayed as `--`

---

## 7. Current state ownership

The web app currently keeps most state in `FretboardApp.jsx`.

### Product state

- selected key
- scale
- instrument
- tuning
- display mode
- start fret
- end fret
- note selections

### UI state

- controls drawer open/closed
- drawer height
- viewport width/height
- smartphone and landscape flags
- standalone/PWA/install state
- offline state

### Persistent local state

- visual settings (`dragon-scales:fretboard-visual-settings`)
- per-instrument string spacing (`dragon-scales:instrument-string-spacing`)

### Native iOS recommendation

Split this into:

1. `FretboardSessionStore`
   - scale/key/instrument/tuning/display/fret range/note visibility

2. `LayoutStore`
   - orientation class
   - safe area values
   - compact/phone/tablet mode
   - drawer state

3. `ThemeStore`
   - theme preset id
   - advanced visual overrides
   - per-instrument spacing

Persist only 1 and 3.

---

## 8. Recommended native architecture

### Preferred target

Use **SwiftUI** for v1 unless a lower-level rendering engine is required later.

### Suggested module split

#### Core module

- note constants
- scale definitions
- tuning definitions
- fretboard model builder
- theme setting normalization

#### Feature module

- fretboard screen
- controls drawer
- theme picker
- visual tweak screen
- export/share actions

#### Rendering module

- fretboard geometry calculator
- fretboard canvas/SVG-equivalent renderer
- note marker renderer

#### Persistence module

- `UserDefaults` wrappers
- versioned saved-settings decoder

### Recommended view hierarchy

```text
FretboardScreen
 ├─ HeaderTitle
 ├─ FretboardRenderPanel
 │   ├─ FretboardGraphicView
 │   └─ CaptionSelectors
 ├─ StatusBannerStack
 └─ BottomControlDrawer
     ├─ Controls
     ├─ Themes
     ├─ Fine Tune
     └─ Optional mockup tabs
```

### Recommended rendering technology

For a true iOS app, prefer:

- **SwiftUI Canvas** or **Core Graphics-backed custom drawing**

Do not start with WebView unless speed is the only goal. The current logic is deterministic enough to port directly.

---

## 9. Parameter optimization for the native rebuild

The web app exposes many visual settings. For iOS, reduce the public tuning surface for v1 and keep advanced controls internal or behind an "Advanced" section.

### Keep user-facing in v1

- theme preset
- instrument string spacing
- display mode
- fret window
- note-degree toggles

### Hide or advanced-only in v1

- panel paddings
- board paddings
- line widths
- fret spacing compression
- note circle radii
- font sizes
- draggable UI mode

### Recommended optimized defaults

Base these on current defaults and keep them stable across devices:

| Parameter | Current default | Recommended native default | Recommended v1 range |
|---|---:|---:|---:|
| panelPaddingX | 8 | 8 | 6-10 |
| panelPaddingTop | 8 | 8 | 6-10 |
| panelPaddingBottom | 8 | 8 | 6-10 |
| leftPad | 44 | 44 | 40-48 |
| topPad | 28 | 28 | 24-30 |
| rightPad | 10 | 10 | 8-14 |
| bottomPad | 13 | 13 | 10-16 |
| compactStringGap | 39 | 39 | 36-42 |
| standardStringGap | 44 | 44 | 41-47 |
| openLaneWidth | 34 | 34 | 30-36 |
| nutLineWidth | 4 | 4 | 3.5-4.5 |
| fretLineWidth | 1.75 | 1.75 | 1.5-2.0 |
| preferredFretWidth | 60 | 60 | 56-64 |
| minFretWidth | 38 | 38 | 36-40 |
| extraFretCompression | 1.4 | 1.4 | 1.2-1.6 |
| shortNoteRadius | 10 | 10 | 9-11 |
| longNoteRadius | 13 | 13 | 12-14 |
| shortNoteFontSize | 10.5 | 10.5 | 10-11 |
| longNoteFontSize | 9.5 | 9.5 | 9-10 |
| stringLabelFontSize | 12 | 12 | 11-13 |
| fretNumberFontSize | 11 | 11 | 10-12 |
| openFretLabelSize | 11 | 11 | 10-12 |
| instrument string spacing scale | 1.00 | 1.00 | 0.90-1.15 |

### Optimization guidance

- Treat current defaults as the baseline visual identity.
- Narrow live-edit ranges to prevent layout breakage on small screens.
- Keep responsive scaling automatic; do not expose it to end users.
- Preserve per-instrument spacing as the only geometry control most users need.

---

## 10. Responsive behavior to recreate natively

### Current web rules

- phone detection uses viewport + user-agent heuristics
- portrait phones are blocked by a rotate screen
- landscape smartphones use tighter layout metrics
- safe-area offsets are manually applied
- header hides when vertical space is tight or drawer lifts the panel

### Native iOS translation

- use size classes and geometry instead of user-agent detection
- support **landscape-only on iPhone** for the main fretboard screen
- allow iPad to use wider layouts
- use safe area insets from SwiftUI/UIKit directly
- replace drawer-lift math with layout constraints and keyboard-safe spacing

---

## 11. Theme system migration plan

### What exists now

Theme system includes:

- 6 named presets
- 1 custom mode
- CSS variable generation
- field normalization
- theme/palette persistence

### Native recreation approach

Create:

- `ThemePreset` enum
- `ThemeSettings` struct
- `ThemePalette` derived values

Rules:

- preset selection applies a full override bundle
- manual edits switch the app to `custom`
- invalid saved values are normalized back to defaults

Do not replicate CSS variables literally. Replace them with typed theme objects.

---

## 12. Export and sharing behavior

### Preserve

- copy tablature text
- save/share tablature text
- export/share graphic fretboard

### Native equivalents

- text export -> share sheet with plain text or `.txt`
- graphic export -> render the fretboard to image or PDF

Recommended order:

1. PNG export
2. PDF export
3. optional SVG export later if required

---

## 13. Features that can be deferred for iOS v1

Safe to defer:

- mockup tabs (`Switchyard`, `Module Wall`, `Patch Bay`)
- draggable visual tuning UI
- full manual fine-tune editor
- install/update/offline banners

Must keep:

- scale computation
- multi-instrument support
- shortened-string handling
- fretboard rendering
- theme presets
- share/export
- safe-area aware landscape experience

---

## 14. Recommended implementation order

1. Build the pure model layer.
2. Recreate the fretboard geometry engine.
3. Render a static fretboard from fixed test inputs.
4. Add scale/key/instrument/tuning controls.
5. Add fret range and interval filters.
6. Add theme preset support.
7. Add persistence.
8. Add export/share.
9. Add advanced visual tuning only if still needed.

---

## 15. Acceptance criteria for parity

The iOS rebuild is functionally faithful when:

- changing key/scale updates notes identically to the web version
- guitar and banjo tunings produce the same active fret positions
- shortened banjo string behavior matches current output
- fret number/note/interval modes match current labels
- fret range logic matches current bounded behavior
- theme presets preserve the current visual identity
- the board remains readable on landscape iPhone sizes
- text export and graphic export both work

---

## 16. Source files to treat as the main reference

Use these as the primary migration references:

- `src/lib/fretboard.js`
- `src/lib/fretboardVisualSettings.js`
- `src/apps/FretboardApp.jsx`
- `src/components/GraphicFretboard.jsx`
- `src/components/OutputPanel.jsx`
- `src/components/ControlsPanel.jsx`
- `public/manifest.webmanifest`
- `public/sw.js`

If behavior is unclear, trust the logic files before the presentation files.
