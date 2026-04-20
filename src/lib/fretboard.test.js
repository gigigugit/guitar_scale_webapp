import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFretboardModel,
  buildScaleChordOptions,
  buildScaleNotes,
  clearChordComputationCaches,
  getAvailableChordStructures,
  getInKeyChordSelection,
  normalizeNoteName,
  noteNameToPitchClass,
  pitchClassToNoteName,
  warmChordSelectionCache,
} from "./fretboard.js";
import { getChordModeNoteStyle } from "./fretboardNoteStyles.js";
import { DEFAULT_FRETBOARD_VISUAL_SETTINGS } from "./fretboardVisualSettings.js";

const ALL_SCALE_DEGREES = [true, true, true, true, true, true, true];

test("normalizes common enharmonic aliases to pitch classes", () => {
  assert.equal(normalizeNoteName("ab"), "A♭");
  assert.equal(normalizeNoteName("C#"), "C#");
  assert.equal(noteNameToPitchClass("G#"), 8);
  assert.equal(noteNameToPitchClass("Ab"), 8);
  assert.equal(noteNameToPitchClass("E♭"), 3);
  assert.equal(pitchClassToNoteName(8, "flat"), "A♭");
  assert.equal(pitchClassToNoteName(8, "sharp"), "G#");
});

test("builds flat-preference major scales consistently", () => {
  assert.deepEqual(buildScaleNotes("A♭", "Major"), ["A♭", "B♭", "C", "D♭", "E♭", "F", "G"]);
});

test("builds sharp-preference major scales consistently", () => {
  assert.deepEqual(buildScaleNotes("F#", "Major"), ["F#", "G#", "A#", "B", "C#", "D#", "F"]);
});

test("derives standard diatonic triads for C major", () => {
  const chords = buildScaleChordOptions("C", "Major", "triad");

  assert.deepEqual(
    chords.map((option) => option.type),
    ["Major", "Minor", "Minor", "Major", "Major", "Minor", "Diminished"],
  );

  assert.deepEqual(
    chords.map((option) => option.degreeLabel),
    ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  );
});

test("derives standard diatonic seventh chords for C major", () => {
  const chords = buildScaleChordOptions("C", "Major", "seventh");

  assert.deepEqual(
    chords.map((option) => option.type),
    ["Major 7", "Minor 7", "Minor 7", "Major 7", "Dominant 7", "Minor 7", "Half-Diminished 7"],
  );

  assert.deepEqual(
    chords.map((option) => option.degreeLabel),
    ["Imaj7", "ii7", "iii7", "IVmaj7", "V7", "vi7", "viiø7"],
  );
});

test("reuses cached chord option arrays for identical scale requests", () => {
  clearChordComputationCaches();

  const first = buildScaleChordOptions("C", "Major", "triad");
  const second = buildScaleChordOptions("C", "Major", "triad");

  assert.equal(first, second);
});

test("limits pentatonic harmony structure options to triads", () => {
  assert.deepEqual(getAvailableChordStructures("Pentatonic Minor"), [{ id: "triad", label: "Triads" }]);
});

test("keeps half-step-down tuning pitch math aligned with flat display output", () => {
  const model = buildFretboardModel({
    selectedKey: "A♭",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Half Step Down (EbAbDbGbBbEb)",
    displayMode: "Note",
    displayTarget: "Scale",
    startFretValue: 0,
    endFretValue: 0,
    highStringValue: 1,
    lowStringValue: 6,
    noteSelections: ALL_SCALE_DEGREES,
  });

  const highStringOpenNote = model.strings[0].notes[0];

  assert.equal(model.strings[0].label, "Eb");
  assert.equal(highStringOpenNote.note, "E♭");
  assert.equal(highStringOpenNote.visible, true);
});

test("highlights scale root notes across the visible fretboard", () => {
  const model = buildFretboardModel({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    displayMode: "Note",
    displayTarget: "Scale",
    startFretValue: 0,
    endFretValue: 3,
    highStringValue: 1,
    lowStringValue: 6,
    noteSelections: ALL_SCALE_DEGREES,
  });

  const rootNotes = model.strings.flatMap((stringRow) => stringRow.notes).filter((note) => note.note === "C" && note.visible);

  assert.ok(rootNotes.length > 0);
  assert.ok(rootNotes.every((note) => note.isRoot === true));
});

test("uses scale-degree fallback labels for non-chord tones in chord interval view", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 5,
  });

  const model = buildFretboardModel({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    displayMode: "Interval",
    displayTarget: "Chord",
    startFretValue: 0,
    endFretValue: 2,
    highStringValue: 1,
    lowStringValue: 6,
    noteSelections: ALL_SCALE_DEGREES,
    chordSelection,
  });

  const aString = model.strings.find((stringRow) => stringRow.label === "A");
  const openNote = aString?.notes.find((note) => note.fret === 0);

  assert.ok(openNote);
  assert.equal(openNote.note, "A");
  assert.equal(openNote.value, "6");
});

test("highlights chord roots even when they are not the selected voicing position note", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 5,
  });

  const model = buildFretboardModel({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    displayMode: "Note",
    displayTarget: "Chord",
    startFretValue: 0,
    endFretValue: 5,
    highStringValue: 1,
    lowStringValue: 6,
    noteSelections: ALL_SCALE_DEGREES,
    chordSelection,
  });

  const offVoicingRoots = model.strings
    .flatMap((stringRow) => stringRow.notes)
    .filter((note) => note.note === chordSelection.root && note.visible && note.active === false);

  assert.ok(offVoicingRoots.length > 0);
  assert.ok(offVoicingRoots.every((note) => note.isRoot === true));
});

test("does not paint off-voicing chord roots with the active chord color", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 5,
  });

  const model = buildFretboardModel({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    displayMode: "Note",
    displayTarget: "Chord",
    startFretValue: 0,
    endFretValue: 5,
    highStringValue: 1,
    lowStringValue: 6,
    noteSelections: ALL_SCALE_DEGREES,
    chordSelection,
  });

  const offVoicingRoot = model.strings
    .flatMap((stringRow) => stringRow.notes)
    .find((note) => note.note === chordSelection.root && note.visible && note.highlighted === false);

  assert.ok(offVoicingRoot);
  assert.deepEqual(getChordModeNoteStyle(offVoicingRoot, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.noteFillColor,
    fillOpacity: 1,
    textFill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.noteTextColor,
    textOpacity: 1,
  });
});

test("stores chord interval labels on rendered chord notes", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "seventh",
    maxFret: 5,
  });

  const model = buildFretboardModel({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    displayMode: "Note",
    displayTarget: "Chord",
    startFretValue: 0,
    endFretValue: 5,
    highStringValue: 1,
    lowStringValue: 6,
    noteSelections: ALL_SCALE_DEGREES,
    chordSelection,
  });

  const activeChordNotes = model.strings.flatMap((stringRow) => stringRow.notes).filter((note) => note.active);
  const activeIntervals = new Set(activeChordNotes.map((note) => note.chordIntervalLabel));

  assert.ok(activeIntervals.has("1"));
  assert.ok(activeIntervals.has("3"));
  assert.ok(activeIntervals.has("5"));
});

test("warms chord selection cache for the active scale context", () => {
  clearChordComputationCaches();

  warmChordSelectionCache({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    maxFret: 5,
  });

  const first = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 5,
  });
  const second = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 5,
  });

  assert.equal(first.chordOptions, second.chordOptions);
  assert.equal(first.variantOptions, second.variantOptions);
});

test("builds compact voicing labels with inversion names instead of shape families", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 12,
  });

  assert.ok(chordSelection.variantOptions.length > 1);
  assert.ok(chordSelection.variantOptions.every((option) => /Position|Inversion/.test(option.label)));
  assert.ok(chordSelection.variantOptions.every((option) => !/Open|Barre|Shape|Closed|Upper/i.test(option.label)));
});

test("keeps every generated voicing inside a four-fret span", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 12,
  });

  chordSelection.variantOptions.forEach((option) => {
    const variantSelection = getInKeyChordSelection({
      selectedKey: "C",
      scaleName: "Major",
      instrument: "Guitar",
      tuningName: "Standard (EADGBE)",
      chordId: "degree-0",
      structureId: "triad",
      variantId: option.id,
      maxFret: 12,
    });
    const activeFrets = variantSelection.positionFrets.filter((fret) => fret >= 0);
    const span = activeFrets.length > 1 ? Math.max(...activeFrets) - Math.min(...activeFrets) : 0;

    assert.ok(span <= 4, `${option.label} exceeded the compact span: ${span}`);
  });
});

test("exposes compact seventh voicings with inversion labels", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-4",
    structureId: "seventh",
    maxFret: 12,
  });

  assert.ok(chordSelection.variantOptions.length > 0);
  assert.ok(chordSelection.variantOptions.every((option) => /(Position|Inversion) - Fret/.test(option.label) || /(Position|Inversion) - Frets/.test(option.label)));
});