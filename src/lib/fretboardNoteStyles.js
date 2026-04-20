const CHORD_HIGHLIGHT_BASE_HUE = 206;
const CHORD_HIGHLIGHT_BASE_LIGHTNESS = 60;
const CHORD_HIGHLIGHT_SATURATION_BY_RANK = [100, 72, 48, 28, 18];

function chordIntervalRank(intervalLabel) {
  switch (intervalLabel) {
    case "1":
      return 0;
    case "b2":
    case "2":
    case "b3":
    case "3":
      return 1;
    case "4":
    case "b5":
    case "5":
    case "#5":
      return 2;
    case "6":
    case "b7":
    case "7":
      return 3;
    default:
      return 4;
  }
}

function chordIntervalFill(intervalLabel) {
  const rank = chordIntervalRank(intervalLabel);
  const saturation = CHORD_HIGHLIGHT_SATURATION_BY_RANK[Math.min(rank, CHORD_HIGHLIGHT_SATURATION_BY_RANK.length - 1)];
  return `hsl(${CHORD_HIGHLIGHT_BASE_HUE} ${saturation}% ${CHORD_HIGHLIGHT_BASE_LIGHTNESS}%)`;
}

export function getChordModeNoteStyle(note, visualSettings) {
  if (note.highlighted) {
    return {
      fill: chordIntervalFill(note.chordIntervalLabel ?? "1"),
      fillOpacity: 1,
      textFill: "#111111",
      textOpacity: 1,
    };
  }

  return {
    fill: visualSettings.noteFillColor,
    fillOpacity: 1,
    textFill: visualSettings.noteTextColor,
    textOpacity: 1,
  };
}

export function getScaleModeNoteStyle(note, visualSettings) {
  if (note.isRoot) {
    return {
      fill: visualSettings.highlightedNoteFillColor,
      fillOpacity: 1,
      textFill: "#111111",
      textOpacity: 1,
    };
  }

  return {
    fill: visualSettings.noteFillColor,
    fillOpacity: 1,
    textFill: visualSettings.noteTextColor,
    textOpacity: 1,
  };
}