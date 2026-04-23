const CHORD_HIGHLIGHT_FILL_BY_RANK = ["#D97D26", "#E0944D", "#E7AB74", "#EDC39B", "#EDC39B"];

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
  return CHORD_HIGHLIGHT_FILL_BY_RANK[Math.min(rank, CHORD_HIGHLIGHT_FILL_BY_RANK.length - 1)];
}

function isFifthFamilyScaleDegree(scaleDegreeLabel) {
  return scaleDegreeLabel === "5" || scaleDegreeLabel === "b5" || scaleDegreeLabel === "#5";
}

function usesAlternateScaleTonePalette(scaleDegreeLabel) {
  return scaleDegreeLabel === "b3" || scaleDegreeLabel === "3" || scaleDegreeLabel === "b7" || scaleDegreeLabel === "7";
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
      fill: visualSettings.rootNoteFillColor,
      fillOpacity: 1,
      textFill: visualSettings.rootNoteTextColor,
      textOpacity: 1,
    };
  }

  if (isFifthFamilyScaleDegree(note.scaleDegreeLabel)) {
    return {
      fill: visualSettings.fifthNoteFillColor,
      fillOpacity: 1,
      textFill: visualSettings.fifthNoteTextColor,
      textOpacity: 1,
    };
  }

  if (usesAlternateScaleTonePalette(note.scaleDegreeLabel)) {
    return {
      fill: visualSettings.altNoteFillColor,
      fillOpacity: 1,
      textFill: visualSettings.altNoteTextColor,
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