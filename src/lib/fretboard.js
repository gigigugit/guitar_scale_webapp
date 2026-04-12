export const NOTES_SHARP = ["C", "C#", "D", "E♭", "E", "F", "F#", "G", "G#", "A", "B♭", "B"];

export const SCALE_INTERVALS = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
  "Pentatonic Major": [0, 2, 4, 7, 9],
  "Pentatonic Minor": [0, 3, 5, 7, 10],
};

export const INSTRUMENTS = {
  Guitar: {
    "Standard (EADGBE)": ["E", "A", "D", "G", "B", "E"],
    "Drop D (DADGBE)": ["D", "A", "D", "G", "B", "E"],
    "Open G (DGDGBD)": ["D", "G", "D", "G", "B", "D"],
  },
  Banjo: {
    "Standard (GDGBD)": ["G", "D", "G", "B", "D"],
  },
};

export const INSTRUMENT_DEFAULT_MAX_FRETS = {
  Guitar: 18,
  Banjo: 22,
};

export const ROMAN_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII"];
export const INTERVAL_LABELS = ["1", "2", "3", "4", "5", "6", "7"];
export const DISPLAY_MODES = ["Fret Number", "Note", "Interval"];
export const VIEW_MODES = ["tablature", "graphic"];

const FRET_MARKERS = new Set([0, 1, 3, 5, 7, 9, 12, 15, 17]);

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

export function buildScaleNotes(key, scaleName) {
  const rootIndex = NOTES_SHARP.indexOf(key);
  return SCALE_INTERVALS[scaleName].map((interval) => NOTES_SHARP[(rootIndex + interval) % 12]);
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

function displayValue(displayMode, fret, note, degreeMap) {
  if (displayMode === "Fret Number") {
    return String(fret);
  }
  if (displayMode === "Note") {
    return note;
  }
  if (displayMode === "Interval") {
    return String(degreeMap.get(note) ?? "1");
  }
  return String(fret);
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
  startFretValue,
  endFretValue,
  highStringValue,
  lowStringValue,
  noteSelections,
}) {
  const model = buildFretboardModel({
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    displayMode,
    startFretValue,
    endFretValue,
    highStringValue,
    lowStringValue,
    noteSelections,
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
  startFretValue,
  endFretValue,
  highStringValue,
  lowStringValue,
  noteSelections,
}) {
  const startFret = Math.min(startFretValue, endFretValue);
  const endFret = Math.max(startFretValue, endFretValue);
  const highString = Math.min(highStringValue, lowStringValue);
  const lowString = Math.max(highStringValue, lowStringValue);

  const scaleNotes = buildScaleNotes(selectedKey, scaleName);
  const activeNotes = selectedScaleNotes(scaleNotes, noteSelections);
  const degreeMap = noteDegreeMap(scaleNotes);

  const tuning = INSTRUMENTS[instrument][tuningName];
  const tuningDisplay = [...tuning].reverse();
  const stringIndices = Array.from({ length: tuning.length }, (_, index) => index + 1);
  const displayIndices = stringIndices.filter((index) => index >= highString && index <= lowString);
  const frets = Array.from({ length: endFret - startFret + 1 }, (_, index) => startFret + index);

  const header = `${selectedKey} ${scaleName} | ${instrument} | ${tuningName} | Frets ${startFret}-${endFret}`;
  const strings = displayIndices.map((index) => {
    const stringNote = tuningDisplay[index - 1];
    const openIndex = NOTES_SHARP.indexOf(stringNote);
    const notes = frets.map((fret) => {
      const note = NOTES_SHARP[(openIndex + fret) % 12];
      return {
        fret,
        note,
        active: activeNotes.has(note),
        value: displayValue(displayMode, fret, note, degreeMap),
      };
    });

    return {
      label: stringNote,
      stringIndex: index,
      notes,
    };
  });

  return {
    header,
    scaleLength: scaleNotes.length,
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
    showOpenStrings: startFret === 0,
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

    stringRow.notes.forEach((note) => {
      line.push(note.active ? note.value.padStart(3, " ") : " --");
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
