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
import { getChordModeNoteStyle, getScaleModeNoteStyle } from "./fretboardNoteStyles.js";
import {
  applyThemePreset,
  DEFAULT_FRETBOARD_VISUAL_SETTINGS,
  deserializeStoredFretboardVisualSettings,
  FRETBOARD_VISUAL_SETTINGS_STORAGE_VERSION,
  serializeFretboardVisualSettings,
  THEME_PRESET_IDS,
} from "./fretboardVisualSettings.js";

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

test("uses degree-aware scale note colors for roots, fifths, and alternate tones", () => {
  assert.deepEqual(getScaleModeNoteStyle({ isRoot: true, scaleDegreeLabel: "1" }, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.rootNoteFillColor,
    fillOpacity: 1,
    textFill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.rootNoteTextColor,
    textOpacity: 1,
  });

  assert.deepEqual(getScaleModeNoteStyle({ isRoot: false, scaleDegreeLabel: "5" }, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.fifthNoteFillColor,
    fillOpacity: 1,
    textFill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.fifthNoteTextColor,
    textOpacity: 1,
  });

  assert.deepEqual(getScaleModeNoteStyle({ isRoot: false, scaleDegreeLabel: "b3" }, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.altNoteFillColor,
    fillOpacity: 1,
    textFill: DEFAULT_FRETBOARD_VISUAL_SETTINGS.altNoteTextColor,
    textOpacity: 1,
  });
});

test("uses the requested orange palette for highlighted chord intervals", () => {
  assert.deepEqual(getChordModeNoteStyle({ highlighted: true, chordIntervalLabel: "1" }, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: "#D97D26",
    fillOpacity: 1,
    textFill: "#111111",
    textOpacity: 1,
  });

  assert.deepEqual(getChordModeNoteStyle({ highlighted: true, chordIntervalLabel: "b3" }, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: "#E0944D",
    fillOpacity: 1,
    textFill: "#111111",
    textOpacity: 1,
  });

  assert.deepEqual(getChordModeNoteStyle({ highlighted: true, chordIntervalLabel: "5" }, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: "#E7AB74",
    fillOpacity: 1,
    textFill: "#111111",
    textOpacity: 1,
  });

  assert.deepEqual(getChordModeNoteStyle({ highlighted: true, chordIntervalLabel: "7" }, DEFAULT_FRETBOARD_VISUAL_SETTINGS), {
    fill: "#EDC39B",
    fillOpacity: 1,
    textFill: "#111111",
    textOpacity: 1,
  });
});

test("serializes visual settings with a storage version envelope", () => {
  const serialized = serializeFretboardVisualSettings(DEFAULT_FRETBOARD_VISUAL_SETTINGS);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.version, FRETBOARD_VISUAL_SETTINGS_STORAGE_VERSION);
  assert.equal(parsed.settings.themePresetId, DEFAULT_FRETBOARD_VISUAL_SETTINGS.themePresetId);
});

test("invalidates legacy stored former-default theme settings", () => {
  const legacyFormerDefault = applyThemePreset(DEFAULT_FRETBOARD_VISUAL_SETTINGS, THEME_PRESET_IDS.VINTAGE_WORKSHOP);
  const result = deserializeStoredFretboardVisualSettings(JSON.stringify(legacyFormerDefault));

  assert.equal(result.clearStoredSettings, true);
  assert.equal(result.normalizedSettings.themePresetId, DEFAULT_FRETBOARD_VISUAL_SETTINGS.themePresetId);
});

test("rewrites preserved legacy stored non-default theme settings into the versioned format", () => {
  const legacyNonDefault = applyThemePreset(DEFAULT_FRETBOARD_VISUAL_SETTINGS, THEME_PRESET_IDS.STAGE_BLACK);
  const result = deserializeStoredFretboardVisualSettings(JSON.stringify(legacyNonDefault));

  assert.equal(result.clearStoredSettings, false);
  assert.equal(result.rewriteStoredSettings, true);
  assert.equal(result.normalizedSettings.themePresetId, THEME_PRESET_IDS.STAGE_BLACK);
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
  assert.ok(chordSelection.variantOptions.every((option) => /Root|3rd|5th|7th/.test(option.label)));
  assert.ok(chordSelection.variantOptions.every((option) => !/Open|Barre|Shape|Moveable|Upper/i.test(option.label)));
});

test("keeps obvious guitar barre voicings available as a dedicated family", () => {
  const rootBarreSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 12,
    voicingFamilyId: "barre",
    inversionId: "inversion-0",
  });

  assert.ok(rootBarreSelection.voicingFamilyOptions.some((option) => option.id === "barre"));

  const renderedFrets = rootBarreSelection.currentVoicings.map((variant) => variant.frets.join(","));

  assert.ok(renderedFrets.includes("-1,3,5,5,5,3"));
  assert.ok(renderedFrets.includes("8,10,10,9,8,8"));
});

test("marks skipped-string voicings as requiring muting instead of discarding them", () => {
  const baseRequest = {
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 12,
  };
  const chordSelection = getInKeyChordSelection(baseRequest);
  let mutingVariant = null;

  for (const familyOption of chordSelection.voicingFamilyOptions) {
    const familySelection = getInKeyChordSelection({
      ...baseRequest,
      voicingFamilyId: familyOption.id,
    });

    for (const inversionOption of familySelection.inversionOptions) {
      const candidateSelection = getInKeyChordSelection({
        ...baseRequest,
        inversionId: inversionOption.id,
        voicingFamilyId: familyOption.id,
      });
      const candidateVariant = candidateSelection.currentVoicings.find((variant) => variant.requiresMuting);

      if (candidateVariant) {
        mutingVariant = candidateVariant;
        break;
      }
    }

    if (mutingVariant) {
      break;
    }
  }

  assert.ok(mutingVariant);
  assert.match(mutingVariant.label, /Requires Muting/);
});

test("classifies voicings by mechanical family and species metadata", () => {
  const openSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "seventh",
    maxFret: 12,
    voicingFamilyId: "open",
  });
  const barreSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "seventh",
    maxFret: 12,
    voicingFamilyId: "barre",
    inversionId: "inversion-1",
  });

  assert.ok(openSelection.currentVoicings.every((variant) => variant.voicingFamilyId === "open"));
  assert.ok(barreSelection.currentVoicings.every((variant) => variant.voicingFamilyId === "barre"));
  assert.ok(barreSelection.currentVoicings.some((variant) => variant.speciesLabel === "Drop 3"));
});

test("labels inversions by the bass interval family", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 5,
  });

  assert.ok(chordSelection.inversionOptions.every((option) => ["Root", "3rd", "5th", "7th"].includes(option.label)));
});

test("organizes chord voicings into family and inversion UI groups", () => {
  const chordSelection = getInKeyChordSelection({
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 12,
  });

  assert.ok(chordSelection.voicingFamilyOptions.length > 0);
  assert.ok(chordSelection.inversionOptions.length > 0);
  assert.equal(chordSelection.currentVoicings.length, chordSelection.positionCount);
  assert.equal(chordSelection.positionOptions.length, chordSelection.positionCount);
  assert.ok(chordSelection.currentVoicings.every((variant) => variant.voicingFamilyId === chordSelection.voicingFamilyId));
  assert.ok(chordSelection.currentVoicings.every((variant) => variant.inversionId === chordSelection.inversionId));
  assert.ok(chordSelection.positionOptions.every((option) => /low|mid|high/.test(option.label)));
});

test("sorts position navigation by minimum fret then average fret and wraps navigation", () => {
  const baseRequest = {
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 12,
  };
  const initialSelection = getInKeyChordSelection(baseRequest);
  let targetSelection = null;

  for (const familyOption of initialSelection.voicingFamilyOptions) {
    const familySelection = getInKeyChordSelection({
      ...baseRequest,
      voicingFamilyId: familyOption.id,
    });

    for (const inversionOption of familySelection.inversionOptions) {
      const candidateSelection = getInKeyChordSelection({
        ...baseRequest,
        inversionId: inversionOption.id,
        voicingFamilyId: familyOption.id,
      });

      if (candidateSelection.positionCount > 1) {
        targetSelection = candidateSelection;
        break;
      }
    }

    if (targetSelection) {
      break;
    }
  }

  assert.ok(targetSelection);

  for (let index = 1; index < targetSelection.currentVoicings.length; index += 1) {
    const previous = targetSelection.currentVoicings[index - 1];
    const current = targetSelection.currentVoicings[index];

    assert.ok(previous.minFret <= current.minFret);
    if (previous.minFret === current.minFret) {
      assert.ok(previous.averageFret <= current.averageFret);
    }
  }

  const wrappedBackward = getInKeyChordSelection({
    ...baseRequest,
    inversionId: targetSelection.inversionId,
    positionIndex: -1,
    voicingFamilyId: targetSelection.voicingFamilyId,
  });
  const wrappedForward = getInKeyChordSelection({
    ...baseRequest,
    inversionId: targetSelection.inversionId,
    positionIndex: targetSelection.positionCount,
    voicingFamilyId: targetSelection.voicingFamilyId,
  });

  assert.equal(wrappedBackward.variantId, targetSelection.currentVoicings[targetSelection.currentVoicings.length - 1].id);
  assert.equal(wrappedForward.variantId, targetSelection.currentVoicings[0].id);
});

test("derives low mid high position labels from the sorted voicing index", () => {
  const baseRequest = {
    selectedKey: "C",
    scaleName: "Major",
    instrument: "Guitar",
    tuningName: "Standard (EADGBE)",
    chordId: "degree-0",
    structureId: "triad",
    maxFret: 12,
  };
  const initialSelection = getInKeyChordSelection(baseRequest);
  let targetSelection = initialSelection;

  for (const familyOption of initialSelection.voicingFamilyOptions) {
    const familySelection = getInKeyChordSelection({
      ...baseRequest,
      voicingFamilyId: familyOption.id,
    });

    for (const inversionOption of familySelection.inversionOptions) {
      const candidateSelection = getInKeyChordSelection({
        ...baseRequest,
        inversionId: inversionOption.id,
        voicingFamilyId: familyOption.id,
      });

      if (candidateSelection.positionCount > targetSelection.positionCount) {
        targetSelection = candidateSelection;
      }
    }
  }

  const firstPosition = getInKeyChordSelection({
    ...baseRequest,
    inversionId: targetSelection.inversionId,
    positionIndex: 0,
    voicingFamilyId: targetSelection.voicingFamilyId,
  });

  assert.equal(firstPosition.positionLabel, targetSelection.positionCount > 1 ? "low" : "mid");

  if (targetSelection.positionCount > 1) {
    const lastPosition = getInKeyChordSelection({
      ...baseRequest,
      inversionId: targetSelection.inversionId,
      positionIndex: targetSelection.positionCount - 1,
      voicingFamilyId: targetSelection.voicingFamilyId,
    });

    assert.equal(lastPosition.positionLabel, "high");
  }

  if (targetSelection.positionCount > 2) {
    const middlePosition = getInKeyChordSelection({
      ...baseRequest,
      inversionId: targetSelection.inversionId,
      positionIndex: 1,
      voicingFamilyId: targetSelection.voicingFamilyId,
    });

    assert.equal(middlePosition.positionLabel, "mid");
  }
});

test("keeps non-open generated voicings inside a four-fret span", () => {
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

    if (!variantSelection.positionFrets.includes(0)) {
      assert.ok(span <= 4, `${option.label} exceeded the compact span without an open string: ${span}`);
    }
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
  assert.ok(chordSelection.variantOptions.every((option) => /(Root|3rd|5th|7th) in Bass - Fret/.test(option.label) || /(Root|3rd|5th|7th) in Bass - Frets/.test(option.label)));
});