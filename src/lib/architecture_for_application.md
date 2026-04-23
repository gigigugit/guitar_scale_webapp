# Guitar Scale Webapp Architecture Overview

## Scope

This app is a React/Vite fretboard viewer for scales and chords across multiple instruments and tunings. The architecture has three main layers:

- Domain logic for notes, scales, chords, tunings, and voicings.
- Visual/theme state for how the fretboard and controls are rendered.
- UI orchestration for loading state, editing it, and rendering the fretboard.

Core files:

- src/lib/fretboard.js
- src/lib/fretboardVisualSettings.js
- src/apps/FretboardApp.jsx
- src/components/GraphicFretboard.jsx
- src/components/OutputPanel.jsx
- src/components/VisualTweaksPanel.jsx

## 1. Domain Model

### Notes and pitch classes

The app normalizes note names into pitch classes in `src/lib/fretboard.js`. Enharmonic spellings are mapped to a single pitch class modulo 12.

A note can be treated as a pitch class:

$$
pc(n) \in \{0,\dots,11\}
$$

where, for example, C = 0, C# = 1, D = 2, and so on.

For any note name $n$ and pitch class $pc$, the app normalizes them through modular arithmetic:

$$
pc(n) = (pc_0 + \Delta) \bmod 12
$$

where $\Delta$ is the interval from the reference root note.

### Scale construction

Scale definitions live in `src/lib/fretboard.js` as interval arrays. For example:

- Major: $[0,2,4,5,7,9,11]$
- Minor: $[0,2,3,5,7,8,10]$
- Pentatonic Major: $[0,2,4,7,9]$
- Pentatonic Minor: $[0,3,5,7,10]$

A scale is built by taking a root pitch class $r$ and adding each interval:

$$
S = \{ (r + i) \bmod 12 \mid i \in I \}
$$

where $I$ is the scale interval set.

The resulting pitch classes are then rendered back into note names with sharp or flat spelling depending on the key context.

### Chord construction from a scale

Chord options are generated from the active scale using chord-structure definitions in `src/lib/fretboard.js`.

The current structures are:

- Triads: offsets $[0,2,4]$
- Sevenths: offsets $[0,2,4,6]$

Given a scale degree $d$, a chord is formed by selecting scale tones at those offsets:

$$
C_d = \{ S_{(d+t)\bmod |S|} \mid t \in T \}
$$

where $T$ is the chord tone-offset set.

The app then derives:

- chord quality
- degree label
- root note
- chord intervals
- display name

### Chord interval logic

Intervals are labeled using semitone distance from the chord root. The mapping is used both for chord labels and note styling.

Examples:

- $0 \rightarrow 1$
- $3 \rightarrow b3$
- $4 \rightarrow 3$
- $7 \rightarrow 5$
- $10 \rightarrow b7$
- $11 \rightarrow 7$

## 2. Instrument and Tuning Model

### Instrument definitions

Instrument and tuning data live in `src/lib/fretboard.js`.

The `INSTRUMENTS` object defines:

- instrument families, such as Guitar and Banjo
- available tunings for each instrument
- per-string note definitions
- special string metadata such as banjo drone strings and non-zero nut frets

Each tuning is normalized into a list of string descriptors with:

- display label
- open-string note
- `nutFret` offset when needed

### Per-instrument options

The UI derives instrument and tuning dropdown options from the `INSTRUMENTS` structure. That means the options are generated from the domain model rather than hardcoded in the component tree.

The selected instrument determines:

- which tuning names are available
- how many strings are shown
- how the fretboard is laid out vertically
- which spacing defaults are used

### Instrument-specific string spacing

Instrument string spacing is persisted separately in `src/apps/FretboardApp.jsx` and injected into the visual settings as `instrumentStringSpacingScale`.

The default spacing map is effectively:

$$
\text{spacing}(instrument) = 1
$$

for each instrument unless the user changes it.

That value affects the layout directly in `src/components/GraphicFretboard.jsx`.

## 3. Chord Voicing and Selection Flow

### Voicing generation

Chord voicings are built in `src/lib/fretboard.js` by searching the fretboard for combinations of chord tones that fit within the current tuning and fret range.

The algorithm:

- enumerates candidate fret positions per string
- combines them into voicing candidates
- rejects voicings that are not playable or do not cover the chord tones
- scores and sorts the candidates
- groups them into family, inversion, and position structures

### Playability and span rules

The voicing logic uses compact playability limits such as:

- maximum fret span
- maximum number of fretted positions
- open-string handling
- muting detection

A useful shorthand is:

$$
\text{span} = \max(f_i) - \min(f_i)
$$

for the active frets in a voicing.

Voicings are grouped into families like:

- Open
- Barre
- Moveable

They are also labeled by inversion and position band:

- Root in bass
- 3rd in bass
- 5th in bass
- 7th in bass
- low / mid / high position

### Chord selection state

The app keeps track of:

- selected chord
- chord structure
- voicing family
- inversion
- position index

Those values are resolved in `src/apps/FretboardApp.jsx` through `getInKeyChordSelection()` from `src/lib/fretboard.js`.

That function bridges the abstract chord model and the UI labels.

## 4. Visual Settings and Theme System

### Theme presets

Theme and visual presentation are centralized in `src/lib/fretboardVisualSettings.js`.

The app defines:

- semantic theme preset IDs
- preset color palettes
- typography choices
- layout metrics
- note colors
- panel and drawer colors

The default theme is stored in `DEFAULT_FRETBOARD_VISUAL_SETTINGS`.

### Visual setting normalization

Visual settings are normalized before use and before persistence.

The normalization pipeline:

- merges candidate settings with defaults
- validates booleans, colors, and select options
- clamps numeric settings to field-specific ranges
- falls back to defaults when values are invalid

This ensures the render path always gets a predictable settings object.

### Persistence and versioning

Visual settings are stored in localStorage with a versioned envelope:

$$
\text{stored value} = \{\text{version}, \text{settings}\}
$$

The version constant is used so old layouts can be migrated or cleared safely.

The main persistence flow is:

- `loadFretboardVisualSettings()`
- `serializeFretboardVisualSettings()`
- `deserializeStoredFretboardVisualSettings()`

## 5. App State Orchestration

### Main state container

The top-level React state lives in `src/apps/FretboardApp.jsx`.

This file owns:

- selected key
- scale name
- instrument and tuning
- display mode
- display target
- fret range
- note selections
- chord selection state
- visual settings
- instrument string spacing
- layout editor state
- drawer and layout toggles

### Derived state

The app uses memoized derived values to keep the display consistent:

- available chord structures
- chord options for the current key and scale
- resolved chord selection
- rendered fretboard model
- responsive visual settings

A key design choice is that the UI state is continuously normalized against the currently valid domain options.

### Layout editor behavior

The Monaco-based editor in `src/components/MonacoOutputPanel.jsx` is backed by serialization and parsing helpers in `src/apps/FretboardApp.jsx`.

There are two modes:

- safe parsing, which normalizes data
- unsafe parsing, which preserves raw values for preview

This gives the editor a bridge between curated controls and direct state editing.

## 6. Rendering Pipeline

### Fretboard model

The renderer does not draw directly from React state. Instead, `src/lib/fretboard.js` builds a plain data model with:

- visible strings
- visible frets
- note positions
- active notes
- root highlighting
- chord interval labels
- display values for fret, note, or interval modes

That model is then consumed by rendering components.

### Graphic layout

`src/components/GraphicFretboard.jsx` computes the SVG geometry.

The key layout idea is:

- vertical spacing comes from string count and instrument spacing scale
- horizontal spacing comes from fret count and board width
- the main board width is stabilized around a reference fret count

That makes the panel more visually consistent even when the displayed fret range changes.

### Output host

`src/components/OutputPanel.jsx` is the host for the rendered fretboard view and the surrounding panel layout.

It is responsible for:

- placing the fretboard in the main panel
- computing the render frame and scaling
- coordinating the visible preview area with the current app state

## 7. Controls and UI Surfaces

### Controls panel

`src/components/VisualTweaksPanel.jsx` renders the user-facing controls for:

- theme settings
- board layout settings
- note styling
- instrument string spacing
- editor visibility toggles

### Editor panel

`src/components/MonacoOutputPanel.jsx` shows the editable JSON state and connects it to the live preview.

That editor is treated as a state surface, not just a text box. It can update:

- `visualSettings`
- `instrumentStringSpacing`
- `uiState`

## 8. Core Math Summary

### Scale math

If the root pitch class is $r$ and the scale intervals are $I$, then the scale is:

$$
S = \{(r+i)\bmod 12 \mid i \in I\}
$$

### Chord math

If a chord is built from scale degree $d$ using tone offsets $T$, then the chord tones are:

$$
C_d = \{S_{(d+t)\bmod |S|} \mid t \in T\}
$$

### Fretboard note placement

For a string with open pitch class $o$ and nut offset $n$, the pitch class at fret $f$ is:

$$
pc(f) = (o + f - n)\bmod 12
$$

That is the basic rule used to decide which note appears at each fret.

### Voicing span

For a voicing with active frets $f_1,\dots,f_k$:

$$
\text{span} = \max(f_i) - \min(f_i)
$$

This helps classify whether the voicing is compact, open, barre-like, or moveable.

## 9. Mental Model

If you want the shortest possible summary of the architecture:

- `fretboard.js` computes the musical truth.
- `fretboardVisualSettings.js` computes the visual truth.
- `FretboardApp.jsx` coordinates both truths into app state.
- `GraphicFretboard.jsx` turns that state into SVG geometry.
- `OutputPanel.jsx` displays the result.
- `VisualTweaksPanel.jsx` and `MonacoOutputPanel.jsx` let you inspect and edit the state.