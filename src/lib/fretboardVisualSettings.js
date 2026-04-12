export const FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY = "dragon-scales:fretboard-visual-settings";

export const FRETBOARD_VISUAL_SETTING_FIELDS = [
  {
    section: "Panel",
    fields: [
      { key: "panelPaddingX", label: "Side padding", description: "Space between the dark panel edge and the fretboard.", min: 0, max: 24, step: 1 },
      { key: "panelPaddingTop", label: "Top padding", description: "Space above the fretboard inside the dark panel.", min: 0, max: 24, step: 1 },
      { key: "panelPaddingBottom", label: "Bottom padding", description: "Space below the fretboard inside the dark panel.", min: 0, max: 24, step: 1 },
      { key: "liftPanelWithDrawer", label: "Lift panel when drawer opens", description: "Moves the fretboard panel upward when the bottom drawer opens.", type: "boolean" },
    ],
  },
  {
    section: "Board Layout",
    fields: [
      { key: "leftPad", label: "Left board padding", description: "Empty SVG space before the string lines begin.", min: 20, max: 80, step: 1 },
      { key: "topPad", label: "Top board padding", description: "Empty SVG space above the first string.", min: 0, max: 50, step: 1 },
      { key: "rightPad", label: "Right board padding", description: "Empty SVG space after the last visible fret.", min: 0, max: 40, step: 1 },
      { key: "bottomPad", label: "Bottom board padding", description: "Extra SVG room below the last string and note circles.", min: 0, max: 32, step: 1 },
      { key: "compactStringGap", label: "Dense string spacing", description: "Vertical spacing used when showing 6 or more strings.", min: 28, max: 60, step: 1 },
      { key: "standardStringGap", label: "Standard string spacing", description: "Vertical spacing used when showing 5 or fewer strings.", min: 28, max: 64, step: 1 },
      { key: "openLaneWidth", label: "Open string lane", description: "Horizontal width reserved for fret 0 when visible.", min: 0, max: 60, step: 1 },
      { key: "preferredFretWidth", label: "Preferred fret spacing", description: "Base width used for each fret before compression.", min: 40, max: 90, step: 1 },
      { key: "minFretWidth", label: "Minimum fret spacing", description: "Smallest width a fret can shrink to.", min: 24, max: 60, step: 1 },
      { key: "extraFretCompression", label: "Extra fret compression", description: "How quickly fret spacing shrinks when many frets are shown.", min: 0, max: 3, step: 0.1 },
    ],
  },
  {
    section: "Labels And Notes",
    fields: [
      { key: "stringLabelFontSize", label: "String label size", description: "Text size for the open-string labels on the left.", min: 8, max: 20, step: 0.5 },
      { key: "fretNumberFontSize", label: "Fret number size", description: "Text size for the fret numbers above the board.", min: 8, max: 18, step: 0.5 },
      { key: "openFretLabelSize", label: "Open fret size", description: "Text size for the open-string 0 marker.", min: 8, max: 18, step: 0.5 },
      { key: "shortNoteRadius", label: "Short note circle size", description: "Circle size for single-character notes and intervals.", min: 6, max: 22, step: 1 },
      { key: "longNoteRadius", label: "Long note circle size", description: "Circle size for longer note labels like C# or III.", min: 8, max: 26, step: 1 },
      { key: "shortNoteFontSize", label: "Short note text size", description: "Label size inside single-character note circles.", min: 7, max: 18, step: 0.5 },
      { key: "longNoteFontSize", label: "Long note text size", description: "Label size inside longer note circles.", min: 7, max: 18, step: 0.5 },
    ],
  },
];

export const DEFAULT_FRETBOARD_VISUAL_SETTINGS = {
  panelPaddingX: 8,
  panelPaddingTop: 8,
  panelPaddingBottom: 8,
  liftPanelWithDrawer: false,
  leftPad: 44,
  topPad: 24,
  rightPad: 10,
  bottomPad: 13,
  compactStringGap: 39,
  standardStringGap: 44,
  openLaneWidth: 34,
  preferredFretWidth: 60,
  minFretWidth: 38,
  extraFretCompression: 1.4,
  stringLabelFontSize: 12,
  fretNumberFontSize: 11,
  openFretLabelSize: 11,
  shortNoteRadius: 10,
  longNoteRadius: 13,
  shortNoteFontSize: 10.5,
  longNoteFontSize: 9.5,
};

export function getSmartphoneOptimizedVisualSettings(settings) {
  const normalized = normalizeFretboardVisualSettings(settings);

  return {
    ...normalized,
    panelPaddingX: Math.min(normalized.panelPaddingX, 4),
    panelPaddingTop: Math.min(normalized.panelPaddingTop, 4),
    panelPaddingBottom: Math.min(normalized.panelPaddingBottom, 4),
    leftPad: Math.min(normalized.leftPad, 34),
    topPad: Math.min(normalized.topPad, 18),
    rightPad: Math.min(normalized.rightPad, 8),
    bottomPad: Math.min(normalized.bottomPad, 10),
    compactStringGap: Math.min(normalized.compactStringGap, 34),
    standardStringGap: Math.min(normalized.standardStringGap, 38),
    openLaneWidth: Math.min(normalized.openLaneWidth, 28),
    preferredFretWidth: Math.min(normalized.preferredFretWidth, 52),
    minFretWidth: Math.min(normalized.minFretWidth, 32),
    stringLabelFontSize: Math.min(normalized.stringLabelFontSize, 10.5),
    fretNumberFontSize: Math.min(normalized.fretNumberFontSize, 9.5),
    openFretLabelSize: Math.min(normalized.openFretLabelSize, 9.5),
  };
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeFretboardVisualSettings(candidate) {
  const merged = { ...DEFAULT_FRETBOARD_VISUAL_SETTINGS, ...(candidate ?? {}) };
  const normalized = { ...merged };

  FRETBOARD_VISUAL_SETTING_FIELDS.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === "boolean") {
        normalized[field.key] = merged[field.key] === true || merged[field.key] === "true";
        return;
      }

      const rawValue = Number(merged[field.key]);
      normalized[field.key] = Number.isFinite(rawValue) ? clampNumber(rawValue, field.min, field.max) : DEFAULT_FRETBOARD_VISUAL_SETTINGS[field.key];
    });
  });

  return normalized;
}

export function loadFretboardVisualSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_FRETBOARD_VISUAL_SETTINGS;
  }

  try {
    const saved = window.localStorage.getItem(FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY);
    if (!saved) {
      return DEFAULT_FRETBOARD_VISUAL_SETTINGS;
    }

    return normalizeFretboardVisualSettings(JSON.parse(saved));
  } catch {
    return DEFAULT_FRETBOARD_VISUAL_SETTINGS;
  }
}
