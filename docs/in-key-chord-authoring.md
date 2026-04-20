# In-Key Chord Authoring

This app does not store a hand-written chord library per key. Chord mode is generated from three inputs:

1. The selected key and scale.
2. The active instrument and tuning.
3. A compact voicing search that walks the neck and keeps only playable shapes that fit inside a four-fret span.

The generator is the runtime source of truth. Reference expectations belong in tests, not in a duplicate per-key chord table.

The selector no longer exposes named shape families. Instead, it lists compact voicings by inversion and fret range, for example `Root Position - Frets 0-3` or `2nd Inversion - Frets 5-8`.

The implementation lives in [src/lib/fretboard.js](../src/lib/fretboard.js).

## How chord mode works

1. `buildScaleChordOptions(selectedKey, scaleName, structureId)` builds one in-key chord per scale degree by stacking scale tones in thirds.
   - `triad` uses degrees `1`, `3`, and `5`.
   - `seventh` uses degrees `1`, `3`, `5`, and `7`.
   - Seventh chords are only exposed for heptatonic scales. Pentatonic scales currently stay on triads.
2. `getInKeyChordSelection(...)` resolves the currently selected degree and generates playable voicings for the current tuning.
3. `buildChordVariants(...)` searches each string for chord tones inside moving four-fret windows, keeps shapes that contain every chord tone, and deduplicates equivalent fret patterns.
4. Each accepted voicing is labeled from its bass note so the UI can show `Root Position`, `1st Inversion`, `2nd Inversion`, or `3rd Inversion` together with the fret range.
5. The fretboard renderer highlights the resolved chord shape in chord mode and can still keep the parent scale visible.
6. Interval labels in chord mode prefer chord-relative degrees for active chord tones and fall back to scale degrees for visible non-chord tones.

## Adding a new instrument

1. Add the instrument to `INSTRUMENTS` in [src/lib/fretboard.js](../src/lib/fretboard.js).
2. Add a matching default fret span in `INSTRUMENT_DEFAULT_MAX_FRETS` if the instrument needs a different neck range.
3. Use the existing tuning schema:
   - Plain strings can be simple note names such as `"E"`.
   - Strings that need a custom UI label or non-zero nut fret should use an object like `{ displayLabel, note, nutFret }`.
4. Run the app and inspect chord mode for several keys and scales on every tuning you added.
5. If the generated shapes are not usable, adjust the compact voicing search heuristics rather than hard-coding one-off chord maps.

## Tuning schema rules

- `note` must be a valid note alias understood by the normalization layer.
- Valid examples include `C#`, `Db`, `E♭`, `Gb`, `A♭`, and `Bb`.
- `displayLabel` is only for the UI.
- `nutFret` is required for shortened strings such as banjo drones.
- Define the tuning array in the same string order used by the rest of the instrument presets in this file.

## Note normalization rules

- The theory engine normalizes note aliases to a 12-pitch-class model before doing scale math or chord math.
- Display output then chooses sharp or flat note names from the selected key context.
- The current goal is pitch-correct output with a consistent display policy. It does not attempt strict spellings such as `E#` or `Cb` unless that becomes a future requirement.

## When you need to tune the generator

Most new tunings should work without new chord data. If shapes need improvement, change these parts in [src/lib/fretboard.js](../src/lib/fretboard.js):

1. `buildChordCandidatesForString(...)`
   - Controls which frets are considered candidate notes per string.
2. `scoreChordVoicing(...)`
   - Controls how the search prefers denser voicings, open strings, compact spans, and duplication.
3. `buildChordVariants(...)`
   - Controls the four-fret window search, deduplication, and final voicing ordering.
4. `getAvailableChordStructures(...)`
   - Controls which harmonic structures are exposed for the selected scale.

## Validation checklist for a new instrument or tuning

1. Major scale in `C`, `G`, and `D`: confirm the expected major, minor, and diminished degree chords appear.
2. Minor scale in `A` and `E`: confirm the expected minor-key degree chords appear.
3. Pentatonic scales: confirm the generated labels and voicings remain playable even when the quality is not a standard major or minor triad.
4. Seventh chords on major and minor scales: confirm the expected `maj7`, `7`, `m7`, and `ø7` degree patterns appear.
5. Open or drone-string tunings: confirm shortened strings land on the expected physical fret positions.
6. Export: confirm text and SVG export names still reflect the selected chord, inversion, and fret range.

## Automated verification

- Theory regressions are covered by [src/lib/fretboard.test.js](../src/lib/fretboard.test.js).
- Use `npm test` before shipping theory changes.
- Add new accepted scale or harmony expectations to tests first, then update the generator.

## Design rule

Prefer extending the generator over adding fixed chord tables. Hard-coded chord libraries should only be introduced if a future instrument cannot be represented by the tuning schema plus the voicing search.