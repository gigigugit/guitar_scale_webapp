const PITCH_CLASS_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PITCH_CLASS_NAMES_FLAT = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const FLAT_MAJOR_KEYS = new Set(["F", "B♭", "E♭", "A♭", "D♭", "G♭"]);
const FLAT_MINOR_KEYS = new Set(["D", "G", "C", "F", "B♭", "E♭"]);

const NOTE_ALIAS_TO_PITCH_CLASS = {
  "B#": 0,
  C: 0,
  "C#": 1,
  Db: 1,
  "D♭": 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  "E♭": 3,
  E: 4,
  Fb: 4,
  "F♭": 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  "G♭": 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  "A♭": 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  "B♭": 10,
  B: 11,
  Cb: 11,
  "C♭": 11,
};

export const KEY_OPTIONS = ["C", "C#", "D", "E♭", "E", "F", "F#", "G", "A♭", "A", "B♭", "B"];
export const NOTES_SHARP = KEY_OPTIONS;

export const SCALE_INTERVALS = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
  "Pentatonic Major": [0, 2, 4, 7, 9],
  "Pentatonic Minor": [0, 3, 5, 7, 10],
};

function labeledString(displayLabel, note) {
  return { displayLabel, note };
}

function banjoDroneString(displayLabel, note) {
  return { displayLabel, note, nutFret: 5 };
}

export const INSTRUMENTS = {
  Guitar: {
    "Standard (EADGBE)": ["E", "A", "D", "G", "B", "E"],
    "Half Step Down (EbAbDbGbBbEb)": [
      labeledString("Eb", "E♭"),
      labeledString("Ab", "G#"),
      labeledString("Db", "C#"),
      labeledString("Gb", "F#"),
      labeledString("Bb", "B♭"),
      labeledString("Eb", "E♭"),
    ],
    "Whole Step Down (DGCFAD)": ["D", "G", "C", "F", "A", "D"],
    "Drop D (DADGBE)": ["D", "A", "D", "G", "B", "E"],
    "Double Drop D (DADGBD)": ["D", "A", "D", "G", "B", "D"],
    "DADGAD (DADGAD)": ["D", "A", "D", "G", "A", "D"],
    "Open D (DADF#AD)": ["D", "A", "D", "F#", "A", "D"],
    "Open E (EBEG#BE)": ["E", "B", "E", "G#", "B", "E"],
    "Open G (DGDGBD)": ["D", "G", "D", "G", "B", "D"],
    "Open C (CGCGCE)": ["C", "G", "C", "G", "C", "E"],
  },
  Banjo: {
    "Standard (GDGBD)": {
      strings: [
        banjoDroneString("g", "G"),
        "D",
        "G",
        "B",
        "D",
      ],
    },
    "C Tuning (gCGBD)": {
      strings: [
        banjoDroneString("g", "G"),
        "C",
        "G",
        "B",
        "D",
      ],
    },
    "Double C (gCGCD)": {
      strings: [
        banjoDroneString("g", "G"),
        "C",
        "G",
        "C",
        "D",
      ],
    },
    "Sawmill (gDGCD)": {
      strings: [
        banjoDroneString("g", "G"),
        "D",
        "G",
        "C",
        "D",
      ],
    },
    "Open D (f#DF#AD)": {
      strings: [
        banjoDroneString("f#", "F#"),
        "D",
        "F#",
        "A",
        "D",
      ],
    },
    "Open C (gCGCE)": {
      strings: [
        banjoDroneString("g", "G"),
        "C",
        "G",
        "C",
        "E",
      ],
    },
    "Open A (aEAC#E)": {
      strings: [
        banjoDroneString("a", "A"),
        "E",
        "A",
        "C#",
        "E",
      ],
    },
  },
};

export const INSTRUMENT_DEFAULT_MAX_FRETS = {
  Guitar: 18,
  Banjo: 22,
};

export const ROMAN_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII"];
export const INTERVAL_LABELS = ["1", "2", "3", "4", "5", "6", "7"];
export const DISPLAY_MODES = ["Fret Number", "Note", "Interval"];
export const DISPLAY_TARGETS = ["Scale", "Chord"];
export const VIEW_MODES = ["tablature", "graphic"];
export const CHORD_STRUCTURE_OPTIONS = [
  {
    id: "triad",
    label: "Triads",
    minimumScaleLength: 3,
    toneOffsets: [0, 2, 4],
  },
  {
    id: "seventh",
    label: "Sevenths",
    minimumScaleLength: 7,
    toneOffsets: [0, 2, 4, 6],
  },
];

const SCALE_NOTES_CACHE = new Map();
const CHORD_STRUCTURE_OPTIONS_CACHE = new Map();
const SCALE_CHORD_OPTIONS_CACHE = new Map();
const CHORD_SELECTION_BASE_CACHE = new Map();
const SCALE_NOTES_CACHE_LIMIT = 96;
const SCALE_CHORD_OPTIONS_CACHE_LIMIT = 192;
const CHORD_SELECTION_BASE_CACHE_LIMIT = 256;

const FRET_MARKERS = new Set([0, 1, 3, 5, 7, 9, 12, 15, 17]);
const CHORD_INTERVAL_LABELS = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "#5", "6", "b7", "7"];
const COMPACT_CHORD_MAX_RESULTS = 18;
const COMPACT_CHORD_MAX_SPAN = 4;
const COMPACT_CHORD_MAX_STRING_CANDIDATES = 6;

const KNOWN_CHORD_QUALITIES = {
  "0,4,7": { label: "Major", slug: "major" },
  "0,3,7": { label: "Minor", slug: "minor" },
  "0,3,6": { label: "Diminished", slug: "diminished" },
  "0,4,8": { label: "Augmented", slug: "augmented" },
  "0,4,7,11": { degreeSuffix: "maj7", label: "Major 7", slug: "major-7" },
  "0,4,7,10": { degreeSuffix: "7", label: "Dominant 7", slug: "dominant-7" },
  "0,3,7,10": { degreeSuffix: "7", label: "Minor 7", slug: "minor-7" },
  "0,3,6,10": { degreeSuffix: "ø7", label: "Half-Diminished 7", slug: "half-diminished-7" },
  "0,3,6,9": { degreeSuffix: "°7", label: "Diminished 7", slug: "diminished-7" },
  "0,2,7": { label: "Sus2", slug: "sus2" },
  "0,5,7": { label: "Sus4", slug: "sus4" },
  "0,4,9": { label: "6 (omit 5)", slug: "6-omit-5" },
  "0,3,8": { label: "Minor b6", slug: "minor-b6" },
  "0,2,9": { label: "6 Sus2", slug: "6-sus2" },
  "0,5,9": { label: "6 Sus4", slug: "6-sus4" },
  "0,2,10": { label: "7 Sus2", slug: "7-sus2" },
  "0,5,10": { label: "7 Sus4", slug: "7-sus4" },
};

function ordinalLabel(value) {
  const remainder100 = value % 100;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function buildCompactVoicingId(index) {
  return `voicing-${index}`;
}

function buildCompactVoicingWindowLabel(minimumFret, maximumFret) {
  if (minimumFret === maximumFret) {
    return `Fret ${minimumFret}`;
  }

  return `Frets ${minimumFret}-${maximumFret}`;
}

function buildInversionLabel(inversionIndex) {
  if (inversionIndex <= 0) {
    return "Root Position";
  }

  return `${ordinalLabel(inversionIndex)} Inversion`;
}

function buildCacheKey(parts) {
  return parts.join("|");
}

function rememberCacheValue(cache, key, value, limit = 0) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  if (limit > 0 && cache.size >= limit) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, value);
  return value;
}

function buildChordSelectionBaseCacheKey({ selectedKey, scaleName, instrument, tuningName, chordId, structureId, maxFret, resolveVoicings }) {
  return buildCacheKey([
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    chordId ?? "",
    structureId,
    String(maxFret),
    resolveVoicings ? "voiced" : "metadata",
  ]);
}

export function clearChordComputationCaches() {
  SCALE_NOTES_CACHE.clear();
  CHORD_STRUCTURE_OPTIONS_CACHE.clear();
  SCALE_CHORD_OPTIONS_CACHE.clear();
  CHORD_SELECTION_BASE_CACHE.clear();
}

export function normalizeNoteName(note) {
  if (typeof note !== "string") {
    return "";
  }

  const trimmed = note.trim();
  const match = trimmed.match(/^([A-Ga-g])([#b♭]?)/);

  if (!match) {
    return trimmed;
  }

  const letter = match[1].toUpperCase();
  const accidental = match[2] === "b" ? "♭" : match[2] ?? "";
  return `${letter}${accidental}`;
}

export function noteNameToPitchClass(note) {
  const normalized = normalizeNoteName(note);
  return NOTE_ALIAS_TO_PITCH_CLASS[normalized] ?? -1;
}

export function isValidNoteName(note) {
  return noteNameToPitchClass(note) >= 0;
}

function normalizePitchClass(pitchClass) {
  return ((pitchClass % 12) + 12) % 12;
}

function shouldPreferFlatNames(key, scaleName) {
  const normalizedKey = normalizeNoteName(key);

  if (normalizedKey.includes("♭")) {
    return true;
  }

  if (normalizedKey.includes("#")) {
    return false;
  }

  const flatKeys = scaleName.includes("Minor") ? FLAT_MINOR_KEYS : FLAT_MAJOR_KEYS;
  return flatKeys.has(normalizedKey);
}

export function pitchClassToNoteName(pitchClass, accidentalPreference = "sharp") {
  const names = accidentalPreference === "flat" ? PITCH_CLASS_NAMES_FLAT : PITCH_CLASS_NAMES_SHARP;
  return names[normalizePitchClass(pitchClass)];
}

function getAccidentalPreference(key, scaleName) {
  return shouldPreferFlatNames(key, scaleName) ? "flat" : "sharp";
}

function getChordStructureDefinition(scaleName, structureId = CHORD_STRUCTURE_OPTIONS[0].id) {
  const scaleLength = SCALE_INTERVALS[scaleName]?.length ?? 0;
  const available = CHORD_STRUCTURE_OPTIONS.filter((option) => scaleLength >= option.minimumScaleLength);

  return available.find((option) => option.id === structureId) ?? available[0] ?? CHORD_STRUCTURE_OPTIONS[0];
}

export function getAvailableChordStructures(scaleName) {
  const cached = CHORD_STRUCTURE_OPTIONS_CACHE.get(scaleName);

  if (cached) {
    return cached;
  }

  const scaleLength = SCALE_INTERVALS[scaleName]?.length ?? 0;
  return rememberCacheValue(
    CHORD_STRUCTURE_OPTIONS_CACHE,
    scaleName,
    CHORD_STRUCTURE_OPTIONS.filter((option) => scaleLength >= option.minimumScaleLength).map((option) => ({
      id: option.id,
      label: option.label,
    })),
  );
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function toBoundedInteger(value, min, max, fallback = min) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return clamp(parsed, min, max);
}

function normalizeTuningString(stringDefinition) {
  if (typeof stringDefinition === "string") {
    return {
      displayLabel: stringDefinition,
      note: stringDefinition,
      nutFret: 0,
    };
  }

  return {
    displayLabel: stringDefinition.displayLabel ?? stringDefinition.note,
    note: stringDefinition.note,
    nutFret: Math.max(Number(stringDefinition.nutFret ?? 0), 0),
  };
}

function normalizeTuningDefinition(tuningDefinition) {
  const tuningStrings = Array.isArray(tuningDefinition) ? tuningDefinition : tuningDefinition?.strings ?? [];
  return tuningStrings.map(normalizeTuningString);
}

export function getTuningStrings(instrument, tuningName) {
  return normalizeTuningDefinition(INSTRUMENTS[instrument][tuningName]);
}

export function buildScaleNotes(key, scaleName) {
  const cacheKey = buildCacheKey([key, scaleName]);
  const cached = SCALE_NOTES_CACHE.get(cacheKey);

  if (cached) {
    return cached;
  }

  const rootIndex = noteNameToPitchClass(key);
  const scaleIntervals = SCALE_INTERVALS[scaleName] ?? [];
  const accidentalPreference = getAccidentalPreference(key, scaleName);

  if (rootIndex < 0) {
    return [];
  }

  return rememberCacheValue(
    SCALE_NOTES_CACHE,
    cacheKey,
    scaleIntervals.map((interval) => pitchClassToNoteName(rootIndex + interval, accidentalPreference)),
    SCALE_NOTES_CACHE_LIMIT,
  );
}

export function noteDegreeMap(scaleNotes) {
  const degreeMap = new Map();
  scaleNotes.forEach((note, index) => {
    if (index < INTERVAL_LABELS.length) {
      degreeMap.set(note, INTERVAL_LABELS[index]);
    }
  });
  return degreeMap;
}

export function selectedScaleNotes(scaleNotes, noteSelections) {
  const selected = new Set();
  noteSelections.forEach((isSelected, index) => {
    if (!isSelected) {
      return;
    }
    if (index < scaleNotes.length) {
      selected.add(scaleNotes[index]);
    }
  });
  return selected;
}

function displayValue(displayMode, fret, note, degreeMap, fallbackDegreeMap = null) {
  if (displayMode === "Fret Number") {
    return String(fret);
  }
  if (displayMode === "Note") {
    return note;
  }
  if (displayMode === "Interval") {
    return String(degreeMap.get(note) ?? fallbackDegreeMap?.get(note) ?? "");
  }
  return String(fret);
}

function displayFretValue(displayMode, fret, stringNutFret, note, degreeMap, fallbackDegreeMap = null) {
  const visibleFret = displayMode === "Fret Number"
    ? (stringNutFret > 0 && fret > stringNutFret ? fret : Math.max(fret - stringNutFret, 0))
    : fret;
  return displayValue(displayMode, visibleFret, note, degreeMap, fallbackDegreeMap);
}

function getNoteIndex(note) {
  return noteNameToPitchClass(note);
}

function uniqueNotes(notes) {
  return [...new Set(notes)];
}

function chordIntervalSet(root, chordNotes) {
  const rootIndex = getNoteIndex(root);
  return chordNotes
    .map((note) => {
      const noteIndex = getNoteIndex(note);
      return noteIndex >= 0 && rootIndex >= 0 ? (noteIndex - rootIndex + 12) % 12 : null;
    })
    .filter((interval) => interval !== null)
    .sort((left, right) => left - right);
}

function buildChordDegreeMap(root, chordNotes) {
  const rootIndex = getNoteIndex(root);

  if (rootIndex < 0) {
    return new Map();
  }

  return new Map(
    chordNotes.map((note) => {
      const noteIndex = getNoteIndex(note);
      const interval = noteIndex >= 0 ? normalizePitchClass(noteIndex - rootIndex) : 0;
      return [note, CHORD_INTERVAL_LABELS[interval] ?? "1"];
    }),
  );
}

function buildUnknownChordLabel(chordNotes) {
  return chordNotes.join("-");
}

function describeChordQuality(intervals, chordNotes) {
  const quality = KNOWN_CHORD_QUALITIES[intervals.join(",")];

  if (quality) {
    return quality;
  }

  const fallbackLabel = buildUnknownChordLabel(chordNotes);
  return {
    label: fallbackLabel,
    slug: fallbackLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
  };
}

function formatChordDegreeLabel(baseRoman, intervals, quality) {
  const hasMajorThird = intervals.includes(4);
  const hasMinorThird = intervals.includes(3) && !hasMajorThird;
  const isDiminished = intervals.includes(3) && intervals.includes(6) && !intervals.includes(7);
  const isAugmented = intervals.includes(4) && intervals.includes(8);
  let label = hasMinorThird ? baseRoman.toLowerCase() : baseRoman;

  if (quality?.degreeSuffix === "ø7") {
    return `${label.toLowerCase()}ø7`;
  }

  if (quality?.degreeSuffix === "°7") {
    return `${label.toLowerCase()}°7`;
  }

  if (quality?.degreeSuffix) {
    return `${label}${quality.degreeSuffix}`;
  }

  if (isDiminished) {
    label = `${label}°`;
  }

  if (isAugmented) {
    label = `${label}+`;
  }

  return label;
}

function buildScaleChordDefinition(scaleNotes, degreeIndex, chordStructure) {
  const root = scaleNotes[degreeIndex];
  const chordNotes = uniqueNotes(chordStructure.toneOffsets.map((offset) => scaleNotes[(degreeIndex + offset) % scaleNotes.length]));
  const intervals = chordIntervalSet(root, chordNotes);
  const quality = describeChordQuality(intervals, chordNotes);
  const baseRoman = ROMAN_LABELS[degreeIndex] ?? String(degreeIndex + 1);
  const degreeLabel = formatChordDegreeLabel(baseRoman, intervals, quality);
  const displayName = quality.label === buildUnknownChordLabel(chordNotes)
    ? `${root} (${quality.label})`
    : `${root} ${quality.label}`;

  return {
    chordStructureId: chordStructure.id,
    chordStructureLabel: chordStructure.label,
    degreeIndex,
    degreeLabel,
    degreeMap: buildChordDegreeMap(root, chordNotes),
    displayName,
    id: `degree-${degreeIndex}`,
    intervals,
    label: `${displayName} - Interval ${degreeLabel}`,
    noteNames: chordNotes,
    root,
    slug: `${root.toLowerCase().replace(/[^a-z0-9#]+/g, "-")}-${quality.slug}`,
    type: quality.label,
  };
}

export function buildScaleChordOptions(selectedKey, scaleName, structureId = CHORD_STRUCTURE_OPTIONS[0].id) {
  const cacheKey = buildCacheKey([selectedKey, scaleName, structureId]);
  const cached = SCALE_CHORD_OPTIONS_CACHE.get(cacheKey);

  if (cached) {
    return cached;
  }

  const scaleNotes = buildScaleNotes(selectedKey, scaleName);
  const chordStructure = getChordStructureDefinition(scaleName, structureId);

  return rememberCacheValue(
    SCALE_CHORD_OPTIONS_CACHE,
    cacheKey,
    scaleNotes.map((_, degreeIndex) => buildScaleChordDefinition(scaleNotes, degreeIndex, chordStructure)),
    SCALE_CHORD_OPTIONS_CACHE_LIMIT,
  );
}

function noteAtFret(stringDefinition, fret, accidentalPreference) {
  const openIndex = getNoteIndex(stringDefinition.note);

  if (openIndex < 0) {
    return null;
  }

  return pitchClassToNoteName(openIndex + (fret - stringDefinition.nutFret), accidentalPreference);
}

function buildChordCandidatesForString(stringDefinition, chordNotes, windowStart, windowEnd, accidentalPreference) {
  const chordNoteSet = new Set(chordNotes);
  const searchStart = Math.max(stringDefinition.nutFret, windowStart);
  const searchEnd = Math.max(searchStart, windowEnd);
  const candidates = [];

  for (let fret = searchStart; fret <= searchEnd; fret += 1) {
    const note = noteAtFret(stringDefinition, fret, accidentalPreference);
    if (!chordNoteSet.has(note)) {
      continue;
    }

    candidates.push({
      fret,
      note,
      nutFret: stringDefinition.nutFret,
    });
  }

  return [{ fret: -1, note: null, nutFret: stringDefinition.nutFret }, ...candidates.slice(0, COMPACT_CHORD_MAX_STRING_CANDIDATES)];
}

function buildVariantView(positionFrets, maxFret) {
  const activeFrets = positionFrets.filter((fret) => fret >= 0);

  if (activeFrets.length === 0) {
    return { endFret: maxFret, startFret: 0 };
  }

  const minimum = Math.min(...activeFrets);
  const maximum = Math.max(...activeFrets);
  return {
    endFret: clamp(maximum + 2, 3, maxFret),
    startFret: clamp(Math.max(minimum - 1, 0), 0, maxFret),
  };
}

function analyzeChordVoicing(candidates) {
  const voiced = candidates.filter((candidate) => candidate.fret >= 0);
  const fretted = voiced.filter((candidate) => candidate.fret > candidate.nutFret);
  const openCount = voiced.filter((candidate) => candidate.fret === candidate.nutFret).length;
  const voicedIndices = candidates.flatMap((candidate, index) => (candidate.fret >= 0 ? [index] : []));
  const contiguousSpan = voicedIndices.length > 0
    ? voicedIndices[voicedIndices.length - 1] - voicedIndices[0] + 1
    : 0;
  const fretCounts = fretted.reduce((counts, candidate) => {
    counts.set(candidate.fret, (counts.get(candidate.fret) ?? 0) + 1);
    return counts;
  }, new Map());
  const repeatedFretEntries = [...fretCounts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return left[0] - right[0];
  });
  const [primaryRepeatedFret, primaryRepeatedCount] = repeatedFretEntries[0] ?? [null, 0];

  return {
    fretted,
    internalMuteCount: voicedIndices.length > 0 ? contiguousSpan - voicedIndices.length : 0,
    lowestVoicedStringIndex: candidates.findIndex((candidate) => candidate.fret >= 0),
    openCount,
    primaryRepeatedCount,
    primaryRepeatedFret,
    voiced,
  };
}

function chordVoicingSortKey(variant) {
  return variant.frets.map((fret) => String(fret).padStart(2, "0")).join(":");
}

function findVoicingInversionIndex(candidates, chordDefinition) {
  const { voiced } = analyzeChordVoicing(candidates);
  const bassNote = voiced[0]?.note ?? chordDefinition.root;
  const inversionIndex = chordDefinition.noteNames.indexOf(bassNote);

  return inversionIndex >= 0 ? inversionIndex : 0;
}

function buildCompactChordVariant(candidates, chordDefinition, maxFret, score, index) {
  const frets = candidates.map((candidate) => candidate.fret);
  const voicedFrets = frets.filter((fret) => fret >= 0);
  const minimumFret = voicedFrets.length > 0 ? Math.min(...voicedFrets) : 0;
  const maximumFret = voicedFrets.length > 0 ? Math.max(...voicedFrets) : 0;
  const inversionIndex = findVoicingInversionIndex(candidates, chordDefinition);
  const inversionLabel = buildInversionLabel(inversionIndex);

  return {
    baseLabel: `${inversionLabel} - ${buildCompactVoicingWindowLabel(minimumFret, maximumFret)}`,
    frets,
    id: buildCompactVoicingId(index),
    inversionIndex,
    label: `${inversionLabel} - ${buildCompactVoicingWindowLabel(minimumFret, maximumFret)}`,
    score,
    view: buildVariantView(frets, maxFret),
  };
}

function scoreChordVoicing(candidates, chordDefinition) {
  const { voiced, internalMuteCount, openCount } = analyzeChordVoicing(candidates);
  const voicedFrets = voiced.map((candidate) => candidate.fret);
  const span = voicedFrets.length > 1 ? Math.max(...voicedFrets) - Math.min(...voicedFrets) : 0;
  const rootCount = voiced.filter((candidate) => candidate.note === chordDefinition.root).length;
  const heardNotes = new Set(voiced.map((candidate) => candidate.note));
  const duplicateCount = voiced.length - heardNotes.size;
  const muteCount = candidates.length - voiced.length;
  const inversionIndex = findVoicingInversionIndex(candidates, chordDefinition);

  return (voiced.length * 60)
    + (rootCount * 9)
    + (openCount * 3)
    - (span * 14)
    - (duplicateCount * 7)
    - (muteCount * 6)
    - (internalMuteCount * 28)
    - inversionIndex;
}

function buildChordVariants(tuning, chordDefinition, maxFret) {
  const minimumSoundedStrings = Math.min(tuning.length, chordDefinition.noteNames.length);
  const chordNoteSet = new Set(chordDefinition.noteNames);
  const variantsByKey = new Map();

  const visitWindow = (windowStart) => {
    const windowEnd = Math.min(windowStart + COMPACT_CHORD_MAX_SPAN, maxFret);
    const candidateLists = tuning.map((stringDefinition) => buildChordCandidatesForString(
      stringDefinition,
      chordDefinition.noteNames,
      windowStart,
      windowEnd,
      chordDefinition.accidentalPreference,
    ));

    const visit = (stringIndex, chosen, heardNotes, soundedCount) => {
      if (stringIndex === candidateLists.length) {
        if (soundedCount < minimumSoundedStrings || heardNotes.size !== chordNoteSet.size) {
          return;
        }

        const voicingAnalysis = analyzeChordVoicing(chosen);
        if (voicingAnalysis.internalMuteCount > 0) {
          return;
        }

        const voicedFrets = voicingAnalysis.voiced.map((candidate) => candidate.fret);
        const span = voicedFrets.length > 1 ? Math.max(...voicedFrets) - Math.min(...voicedFrets) : 0;
        if (span > COMPACT_CHORD_MAX_SPAN) {
          return;
        }

        const score = scoreChordVoicing(chosen, chordDefinition);
        const frets = chosen.map((candidate) => candidate.fret);
        const key = frets.join(",");
        const existing = variantsByKey.get(key);

        if (!existing || score > existing.score) {
          variantsByKey.set(key, { frets, score });
        }
        return;
      }

      const remainingStrings = candidateLists.length - stringIndex;
      if (soundedCount + remainingStrings < minimumSoundedStrings) {
        return;
      }

      if (heardNotes.size + remainingStrings < chordNoteSet.size) {
        return;
      }

      candidateLists[stringIndex].forEach((candidate) => {
        const nextHeardNotes = candidate.note
          ? new Set([...heardNotes, candidate.note])
          : heardNotes;

        visit(
          stringIndex + 1,
          [...chosen, candidate],
          nextHeardNotes,
          soundedCount + (candidate.fret >= 0 ? 1 : 0),
        );
      });
    };

    visit(0, [], new Set(), 0);
  };

  for (let windowStart = 0; windowStart <= maxFret; windowStart += 1) {
    visitWindow(windowStart);
  }

  return [...variantsByKey.values()]
    .map(({ frets, score }) => ({ frets, score }))
    .sort((left, right) => {
      const leftActiveFrets = left.frets.filter((fret) => fret >= 0);
      const rightActiveFrets = right.frets.filter((fret) => fret >= 0);
      const leftMin = leftActiveFrets.length > 0 ? Math.min(...leftActiveFrets) : 0;
      const rightMin = rightActiveFrets.length > 0 ? Math.min(...rightActiveFrets) : 0;
      if (leftMin !== rightMin) {
        return leftMin - rightMin;
      }

      const leftInversion = findVoicingInversionIndex(left.frets.map((fret, index) => ({ fret, note: fret >= 0 ? noteAtFret(tuning[index], fret, chordDefinition.accidentalPreference) : null, nutFret: tuning[index].nutFret })), chordDefinition);
      const rightInversion = findVoicingInversionIndex(right.frets.map((fret, index) => ({ fret, note: fret >= 0 ? noteAtFret(tuning[index], fret, chordDefinition.accidentalPreference) : null, nutFret: tuning[index].nutFret })), chordDefinition);
      if (leftInversion !== rightInversion) {
        return leftInversion - rightInversion;
      }

      const leftMax = leftActiveFrets.length > 0 ? Math.max(...leftActiveFrets) : 0;
      const rightMax = rightActiveFrets.length > 0 ? Math.max(...rightActiveFrets) : 0;
      if (leftMax !== rightMax) {
        return leftMax - rightMax;
      }

      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return chordVoicingSortKey(left).localeCompare(chordVoicingSortKey(right));
    })
    .slice(0, COMPACT_CHORD_MAX_RESULTS)
    .map((variant, index) => buildCompactChordVariant(
      variant.frets.map((fret, stringIndex) => ({
        fret,
        note: fret >= 0 ? noteAtFret(tuning[stringIndex], fret, chordDefinition.accidentalPreference) : null,
        nutFret: tuning[stringIndex].nutFret,
      })),
      chordDefinition,
      maxFret,
      variant.score,
      index,
    ))
    .map((variant, _, variants) => {
      const duplicateCount = variants.filter((currentVariant) => currentVariant.baseLabel === variant.baseLabel).length;

      if (duplicateCount <= 1) {
        return variant;
      }

      const occurrence = variants
        .filter((currentVariant) => currentVariant.baseLabel === variant.baseLabel)
        .findIndex((currentVariant) => currentVariant.id === variant.id) + 1;

      return {
        ...variant,
        label: `${variant.baseLabel} - Voicing ${occurrence}`,
      };
    });
}

function buildChordSelectionNotice(chordOptions, resolvedChord, resolvedVariant) {
  if (!chordOptions.length) {
    return "No in-key chords are available for the selected scale yet.";
  }

  if (!resolvedVariant) {
    return `No playable ${resolvedChord?.displayName ?? "chord"} voicing was generated for the current tuning.`;
  }

  return null;
}

function buildChordSelectionBase({
  selectedKey,
  scaleName,
  instrument,
  tuningName,
  chordId,
  chordOptions = null,
  chordStructureOptions = null,
  resolveVoicings = true,
  structureId = CHORD_STRUCTURE_OPTIONS[0].id,
  maxFret = 18,
}) {
  const chordStructure = getChordStructureDefinition(scaleName, structureId);
  const resolvedChordOptions = chordOptions ?? buildScaleChordOptions(selectedKey, scaleName, chordStructure.id);
  const resolvedChordStructureOptions = chordStructureOptions ?? getAvailableChordStructures(scaleName);
  const resolvedChord = resolvedChordOptions.find((option) => option.id === chordId) ?? resolvedChordOptions[0] ?? null;
  const tuning = resolveVoicings && resolvedChord ? getTuningStrings(instrument, tuningName) : [];
  const chordDefinition = resolveVoicings && resolvedChord
    ? {
        ...resolvedChord,
        accidentalPreference: getAccidentalPreference(selectedKey, scaleName),
        instrument,
        tuningName,
      }
    : null;
  const variants = chordDefinition ? buildChordVariants(tuning, chordDefinition, maxFret) : [];
  const resolvedVariants = Object.fromEntries(variants.map((variant) => [variant.id, variant]));
  const variantOptions = variants.map((variant) => ({
    id: variant.id,
    label: variant.label,
    disabled: !resolveVoicings,
  }));

  return {
    chordId: resolvedChord?.id ?? chordId,
    chordOptions: resolvedChordOptions,
    chordStructureId: chordStructure.id,
    chordStructureLabel: chordStructure.label,
    chordStructureOptions: resolvedChordStructureOptions,
    degreeLabel: resolvedChord?.degreeLabel ?? "",
    degreeMap: resolvedChord?.degreeMap ?? new Map(),
    displayName: resolvedChord?.displayName ?? `${selectedKey} ${scaleName}`,
    intervals: resolvedChord?.intervals ?? [],
    noteNames: resolvedChord?.noteNames ?? [],
    resolvedChord,
    resolvedVariants,
    root: resolvedChord?.root ?? selectedKey,
    slug: resolvedChord?.slug ?? `${selectedKey.toLowerCase()}-${scaleName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    type: resolvedChord?.type ?? scaleName,
    variantOptions,
  };
}

function getCachedChordSelectionBase({
  selectedKey,
  scaleName,
  instrument,
  tuningName,
  chordId,
  chordOptions = null,
  chordStructureOptions = null,
  resolveVoicings = true,
  structureId = CHORD_STRUCTURE_OPTIONS[0].id,
  maxFret = 18,
}) {
  const cacheKey = buildChordSelectionBaseCacheKey({
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    chordId,
    structureId,
    maxFret,
    resolveVoicings,
  });
  const cached = CHORD_SELECTION_BASE_CACHE.get(cacheKey);

  if (cached) {
    return cached;
  }

  return rememberCacheValue(
    CHORD_SELECTION_BASE_CACHE,
    cacheKey,
    buildChordSelectionBase({
      selectedKey,
      scaleName,
      instrument,
      tuningName,
      chordId,
      chordOptions,
      chordStructureOptions,
      resolveVoicings,
      structureId,
      maxFret,
    }),
    CHORD_SELECTION_BASE_CACHE_LIMIT,
  );
}

export function warmChordSelectionCache({ selectedKey, scaleName, instrument, tuningName, maxFret = 18 }) {
  const availableStructures = getAvailableChordStructures(scaleName);

  availableStructures.forEach((structure) => {
    const chordOptions = buildScaleChordOptions(selectedKey, scaleName, structure.id);

    chordOptions.forEach((option) => {
      getCachedChordSelectionBase({
        selectedKey,
        scaleName,
        instrument,
        tuningName,
        chordId: option.id,
        chordOptions,
        chordStructureOptions: availableStructures,
        resolveVoicings: true,
        structureId: structure.id,
        maxFret,
      });
    });
  });
}

export function getInKeyChordSelection({
  selectedKey,
  scaleName,
  instrument,
  tuningName,
  chordId,
  variantId,
  chordOptions = null,
  chordStructureOptions = null,
  resolveVoicings = true,
  structureId = CHORD_STRUCTURE_OPTIONS[0].id,
  maxFret = 18,
}) {
  const {
    resolvedChord,
    resolvedVariants,
    variantOptions,
    ...selectionBase
  } = getCachedChordSelectionBase({
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    chordId,
    chordOptions,
    chordStructureOptions,
    resolveVoicings,
    structureId,
    maxFret,
  });
  const resolvedVariantOption = resolveVoicings
    ? variantOptions.find((option) => option.id === variantId && !option.disabled)
      ?? variantOptions.find((option) => !option.disabled)
      ?? variantOptions[0]
      ?? null
    : variantOptions.find((option) => option.id === variantId)
      ?? variantOptions[0]
      ?? null;
  const resolvedVariant = resolvedVariantOption ? resolvedVariants[resolvedVariantOption.id] ?? null : null;

  return {
    ...selectionBase,
    available: Boolean(resolvedChord && resolvedVariant),
    notice: resolveVoicings ? buildChordSelectionNotice(selectionBase.chordOptions, resolvedChord, resolvedVariant) : null,
    positionFrets: resolvedVariant?.frets ?? [],
    variantId: resolveVoicings ? resolvedVariantOption?.id ?? variantId : variantId,
    variantLabel: resolvedVariant?.label ?? resolvedVariantOption?.label ?? "Position",
    variantOptions,
    view: resolvedVariant?.view ?? { endFret: maxFret, startFret: 0 },
  };
}

function formatCell(displayMode, fret, note, degreeMap) {
  return displayValue(displayMode, fret, note, degreeMap).padStart(3, " ");
}

function buildFretMarkerLine(startFret, endFret) {
  const parts = ["Fret:"];
  let firstCell = true;

  for (let fret = startFret; fret <= endFret; fret += 1) {
    const cellWidth = firstCell ? 2 : 3;
    if (FRET_MARKERS.has(fret)) {
      parts.push(String(fret).padStart(cellWidth, " "));
    } else {
      parts.push(" ".repeat(cellWidth));
    }
    firstCell = false;
  }

  return parts.join("");
}

export function renderFretboard({
  selectedKey,
  scaleName,
  instrument,
  tuningName,
  displayMode,
  displayTarget = DISPLAY_TARGETS[0],
  startFretValue,
  endFretValue,
  highStringValue,
  lowStringValue,
  noteSelections,
  chordSelection = null,
}) {
  const model = buildFretboardModel({
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    displayMode,
    displayTarget,
    startFretValue,
    endFretValue,
    highStringValue,
    lowStringValue,
    noteSelections,
    chordSelection,
  });

  return {
    ...model,
    output: renderTablature(model),
  };
}

export function buildFretboardModel({
  selectedKey,
  scaleName,
  instrument,
  tuningName,
  displayMode,
  displayTarget = DISPLAY_TARGETS[0],
  startFretValue,
  endFretValue,
  highStringValue,
  lowStringValue,
  noteSelections,
  chordSelection = null,
}) {
  const startFret = Math.min(startFretValue, endFretValue);
  const endFret = Math.max(startFretValue, endFretValue);
  const highString = Math.min(highStringValue, lowStringValue);
  const lowString = Math.max(highStringValue, lowStringValue);
  const isChordMode = displayTarget === "Chord";
  const accidentalPreference = getAccidentalPreference(selectedKey, scaleName);

  const scaleNotes = buildScaleNotes(selectedKey, scaleName);
  const activeNotes = selectedScaleNotes(scaleNotes, noteSelections);
  const scaleDegreeMap = noteDegreeMap(scaleNotes);
  const degreeMap = isChordMode ? chordSelection?.degreeMap ?? new Map() : scaleDegreeMap;
  const fallbackDegreeMap = isChordMode ? scaleDegreeMap : null;
  const highlightedRootNote = isChordMode ? chordSelection?.root ?? selectedKey : selectedKey;

  const tuning = getTuningStrings(instrument, tuningName);
  const tuningDisplay = [...tuning].reverse();
  const stringIndices = Array.from({ length: tuning.length }, (_, index) => index + 1);
  const displayIndices = stringIndices.filter((index) => index >= highString && index <= lowString);
  const frets = Array.from({ length: endFret - startFret + 1 }, (_, index) => startFret + index);
  const displayedStrings = displayIndices.map((index) => tuningDisplay[index - 1]);

  const header = isChordMode
    ? `${chordSelection?.displayName ?? "Chord"} | ${chordSelection?.variantLabel ?? "Position"} | ${instrument} | ${tuningName} | Frets ${startFret}-${endFret}`
    : `${selectedKey} ${scaleName} | ${instrument} | ${tuningName} | Frets ${startFret}-${endFret}`;
  const strings = displayIndices.map((index) => {
    const stringDefinition = tuningDisplay[index - 1];
    const tuningSourceIndex = tuning.length - index;
    const chordFret = isChordMode ? Number(chordSelection?.positionFrets?.[tuningSourceIndex] ?? -1) : -1;
    const notes = frets
      .filter((fret) => fret >= stringDefinition.nutFret)
      .map((fret) => {
        const note = noteAtFret(stringDefinition, fret, accidentalPreference);
        const inSelectedScale = activeNotes.has(note);
        const isChordPositionNote = isChordMode ? fret === chordFret : false;
        const chordIntervalLabel = isChordMode ? chordSelection?.degreeMap?.get(note) ?? null : null;
        const isRootNote = note === highlightedRootNote;
        const active = isChordMode ? isChordPositionNote : inSelectedScale;
        const visible = inSelectedScale;

        return {
          fret,
          note,
          active,
          chordIntervalLabel,
          highlighted: isChordPositionNote,
          isRoot: isRootNote,
          visible,
          value: displayFretValue(displayMode, fret, stringDefinition.nutFret, note, degreeMap, fallbackDegreeMap),
        };
      });

    return {
      label: stringDefinition.displayLabel,
      note: stringDefinition.note,
      nutFret: stringDefinition.nutFret,
      stringIndex: index,
      notes,
    };
  });

  return {
    header,
    scaleLength: scaleNotes.length,
    displayTarget,
    startFret,
    endFret,
    displayCount: displayIndices.length,
    displayMode,
    frets,
    fretMarkers: frets.filter((fret) => FRET_MARKERS.has(fret)),
    instrument,
    lowString,
    scaleName,
    selectedKey,
    showOpenStrings: startFret === 0 && displayedStrings.some((stringDefinition) => stringDefinition.nutFret === 0),
    strings,
    tuningName,
  };
}

export function renderTablature(model) {
  const fretLine = buildFretMarkerLine(model.startFret, model.endFret);
  const divider = "-".repeat(Math.max(model.header.length, fretLine.length));
  const lines = [model.header, fretLine, divider];

  model.strings.forEach((stringRow) => {
    const line = [`${stringRow.label.padStart(2, " ")} |`];
    const notesByFret = new Map(stringRow.notes.map((note) => [note.fret, note]));

    model.frets.forEach((fret) => {
      const note = notesByFret.get(fret);

      if (!note) {
        line.push("   ");
        return;
      }

      line.push((note.visible ?? note.active) ? note.value.padStart(3, " ") : " --");
    });

    lines.push(line.join(""));
  });

  return lines.join("\n");
}

export function buildDownloadName(selectedKey, scaleName) {
  const keyPart = selectedKey.toLowerCase().replace(/[^a-z0-9#]+/g, "-");
  const scalePart = scaleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${keyPart}-${scalePart}-fretboard.txt`;
}
