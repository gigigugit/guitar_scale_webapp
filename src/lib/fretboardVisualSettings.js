export const FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY = "dragon-scales:fretboard-visual-settings";

export const THEME_PRESET_IDS = {
  VINTAGE_WORKSHOP: "vintage-workshop",
  STAGE_BLACK: "stage-black",
  MODERN_LUTHIER: "modern-luthier",
  NEON_FRET_LAB: "neon-fret-lab",
  PAPER_PRACTICE_NOTEBOOK: "paper-practice-notebook",
  STUDIO_CONSOLE: "studio-console",
  CUSTOM: "custom",
};

export const FONT_FAMILY_OPTIONS = [
  { label: "Trebuchet", value: '"Trebuchet MS", "Segoe UI", sans-serif' },
  { label: "Avenir", value: '"Avenir Next", "Segoe UI", sans-serif' },
  { label: "Georgia", value: 'Georgia, "Times New Roman", serif' },
  { label: "Gill Sans", value: '"Gill Sans", "Segoe UI", sans-serif' },
  { label: "Palatino", value: '"Palatino Linotype", "Book Antiqua", serif' },
  { label: "Optima", value: 'Optima, "Segoe UI", sans-serif' },
  { label: "Monospace", value: '"IBM Plex Mono", "Courier New", monospace' },
];

export const FRET_SPACING_MODE_OPTIONS = [
  { label: "Uniform", value: "uniform" },
  { label: "Scale-style", value: "tempered" },
];

const THEME_FIELD_KEYS = [
  "appBackgroundColor",
  "appBackgroundAccentColor",
  "appGlowColor",
  "appTextColor",
  "uiFontFamily",
  "surfaceColor",
  "surfaceStrongColor",
  "borderColor",
  "mutedTextColor",
  "accentColor",
  "accentStrongColor",
  "accentTextColor",
  "drawerBackgroundStartColor",
  "drawerBackgroundEndColor",
  "drawerBorderColor",
  "titleFontFamily",
  "titleColor",
  "titleFontSizeDesktop",
  "titleFontSizeMobile",
  "fretboardFontFamily",
  "stringLabelColor",
  "stringLineColor",
  "fretLineColor",
  "fretNumberColor",
  "openFretLabelColor",
  "markerColor",
  "markerOpacity",
  "noteFillColor",
  "highlightedNoteFillColor",
  "noteTextColor",
  "fretboardPanelColor",
];

const STAGE_BLACK_THEME_OVERRIDES = {
  appBackgroundColor: "#030303",
  appBackgroundAccentColor: "#141414",
  appGlowColor: "#666666",
  appTextColor: "#c9c9c9",
  uiFontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  surfaceColor: "#171717",
  surfaceStrongColor: "#1f1f1f",
  borderColor: "#2c2c2c",
  mutedTextColor: "#8e8e8e",
  accentColor: "#565656",
  accentStrongColor: "#6f6f6f",
  accentTextColor: "#ededed",
  drawerBackgroundStartColor: "#1a1a1a",
  drawerBackgroundEndColor: "#0c0c0c",
  drawerBorderColor: "#262626",
  titleFontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  titleColor: "#d7d7d7",
  titleFontSizeDesktop: 1.85,
  titleFontSizeMobile: 1.3,
  fretboardFontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  stringLabelColor: "#a7a7a7",
  stringLineColor: "#5c5c5c",
  fretLineColor: "#444444",
  fretNumberColor: "#8f8f8f",
  openFretLabelColor: "#8f8f8f",
  markerColor: "#3a3a3a",
  markerOpacity: 0.22,
  noteFillColor: "#cfbaa4",
  highlightedNoteFillColor: "#bc8457",
  noteTextColor: "#111111",
  fretboardPanelColor: "#101010",
};

const VINTAGE_WORKSHOP_THEME_OVERRIDES = {
  appBackgroundColor: "#efe3d2",
  appBackgroundAccentColor: "#dcc4a8",
  appGlowColor: "#d6a871",
  appTextColor: "#3a291f",
  uiFontFamily: '"Gill Sans", "Segoe UI", sans-serif',
  surfaceColor: "#fbf3eb",
  surfaceStrongColor: "#fff9f3",
  borderColor: "#d4c0af",
  mutedTextColor: "#7c6658",
  accentColor: "#6e4328",
  accentStrongColor: "#8d5b37",
  accentTextColor: "#f8e4cc",
  drawerBackgroundStartColor: "#f9f0e6",
  drawerBackgroundEndColor: "#eedecc",
  drawerBorderColor: "#ccb59f",
  titleFontFamily: 'Georgia, "Times New Roman", serif',
  titleColor: "#442a1d",
  titleFontSizeDesktop: 1.95,
  titleFontSizeMobile: 1.35,
  fretboardFontFamily: '"Gill Sans", "Segoe UI", sans-serif',
  stringLabelColor: "#f2d1a4",
  stringLineColor: "#d7ba8d",
  fretLineColor: "#8d6a4f",
  fretNumberColor: "#f2cfaa",
  openFretLabelColor: "#f2cfaa",
  markerColor: "#714b32",
  markerOpacity: 0.32,
  noteFillColor: "#f0cfaa",
  highlightedNoteFillColor: "#0566F0",
  noteTextColor: "#4a3021",
  fretboardPanelColor: "#5d3a28",
};

const THEME_PRESET_OVERRIDES = {
  [THEME_PRESET_IDS.VINTAGE_WORKSHOP]: VINTAGE_WORKSHOP_THEME_OVERRIDES,
  [THEME_PRESET_IDS.STAGE_BLACK]: STAGE_BLACK_THEME_OVERRIDES,
  [THEME_PRESET_IDS.MODERN_LUTHIER]: {
    appBackgroundColor: "#f3eee5",
    appBackgroundAccentColor: "#d9c3a8",
    appGlowColor: "#c88f57",
    appTextColor: "#2f2d2a",
    uiFontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    surfaceColor: "#faf7f2",
    surfaceStrongColor: "#fffdfa",
    borderColor: "#d3c5b6",
    mutedTextColor: "#756d64",
    accentColor: "#a16135",
    accentStrongColor: "#7c4a2b",
    accentTextColor: "#fff7ec",
    drawerBackgroundStartColor: "#fff8ef",
    drawerBackgroundEndColor: "#f0e5d6",
    drawerBorderColor: "#d8c8b7",
    titleFontFamily: '"Palatino Linotype", "Book Antiqua", serif',
    titleColor: "#433328",
    titleFontSizeDesktop: 1.92,
    titleFontSizeMobile: 1.34,
    fretboardFontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    stringLabelColor: "#f4d7ae",
    stringLineColor: "#c8ae8f",
    fretLineColor: "#8d6d55",
    fretNumberColor: "#f2d4ae",
    openFretLabelColor: "#f2d4ae",
    markerColor: "#8f6a4a",
    markerOpacity: 0.26,
    noteFillColor: "#e7b784",
    highlightedNoteFillColor: "#0566F0",
    noteTextColor: "#42291b",
    fretboardPanelColor: "#4b3429",
  },
  [THEME_PRESET_IDS.NEON_FRET_LAB]: {
    appBackgroundColor: "#09111e",
    appBackgroundAccentColor: "#121d34",
    appGlowColor: "#0fd0c7",
    appTextColor: "#e5f7ff",
    uiFontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    surfaceColor: "#122033",
    surfaceStrongColor: "#17283f",
    borderColor: "#26415f",
    mutedTextColor: "#8eb8cc",
    accentColor: "#14d7cf",
    accentStrongColor: "#ff7b64",
    accentTextColor: "#071018",
    drawerBackgroundStartColor: "#13243b",
    drawerBackgroundEndColor: "#0a1322",
    drawerBorderColor: "#2c4e75",
    titleFontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    titleColor: "#f1fffe",
    titleFontSizeDesktop: 1.98,
    titleFontSizeMobile: 1.38,
    fretboardFontFamily: '"IBM Plex Mono", "Courier New", monospace',
    stringLabelColor: "#9af7f1",
    stringLineColor: "#38b8c8",
    fretLineColor: "#5f8cc8",
    fretNumberColor: "#a2f1ff",
    openFretLabelColor: "#a2f1ff",
    markerColor: "#143a65",
    markerOpacity: 0.42,
    noteFillColor: "#ff8c73",
    highlightedNoteFillColor: "#0566F0",
    noteTextColor: "#071018",
    fretboardPanelColor: "#07111d",
  },
  [THEME_PRESET_IDS.PAPER_PRACTICE_NOTEBOOK]: {
    appBackgroundColor: "#f6f0df",
    appBackgroundAccentColor: "#e2d6b3",
    appGlowColor: "#a3bfd8",
    appTextColor: "#2f3e4b",
    uiFontFamily: '"Gill Sans", "Segoe UI", sans-serif',
    surfaceColor: "#fffdf7",
    surfaceStrongColor: "#fffaf0",
    borderColor: "#d9cfbf",
    mutedTextColor: "#768492",
    accentColor: "#3a77aa",
    accentStrongColor: "#d76857",
    accentTextColor: "#fefefe",
    drawerBackgroundStartColor: "#fffdf6",
    drawerBackgroundEndColor: "#efe7d5",
    drawerBorderColor: "#d7ccb7",
    titleFontFamily: '"Palatino Linotype", "Book Antiqua", serif',
    titleColor: "#334758",
    titleFontSizeDesktop: 1.88,
    titleFontSizeMobile: 1.3,
    fretboardFontFamily: '"Gill Sans", "Segoe UI", sans-serif',
    stringLabelColor: "#efe6cf",
    stringLineColor: "#b0b9c6",
    fretLineColor: "#7f8b98",
    fretNumberColor: "#f9efda",
    openFretLabelColor: "#f9efda",
    markerColor: "#7c94aa",
    markerOpacity: 0.28,
    noteFillColor: "#e16757",
    highlightedNoteFillColor: "#0566F0",
    noteTextColor: "#fff9f4",
    fretboardPanelColor: "#5e7488",
  },
  [THEME_PRESET_IDS.STUDIO_CONSOLE]: {
    appBackgroundColor: "#161b1f",
    appBackgroundAccentColor: "#2f353c",
    appGlowColor: "#58a97f",
    appTextColor: "#dbe5ea",
    uiFontFamily: 'Optima, "Segoe UI", sans-serif',
    surfaceColor: "#21272c",
    surfaceStrongColor: "#2a3137",
    borderColor: "#46515b",
    mutedTextColor: "#9eaeb7",
    accentColor: "#58a97f",
    accentStrongColor: "#9bc7aa",
    accentTextColor: "#0f1714",
    drawerBackgroundStartColor: "#2b3238",
    drawerBackgroundEndColor: "#181e22",
    drawerBorderColor: "#4d5963",
    titleFontFamily: 'Optima, "Segoe UI", sans-serif',
    titleColor: "#eff6f8",
    titleFontSizeDesktop: 1.9,
    titleFontSizeMobile: 1.33,
    fretboardFontFamily: '"IBM Plex Mono", "Courier New", monospace',
    stringLabelColor: "#d2e9dc",
    stringLineColor: "#8ab89e",
    fretLineColor: "#6f8d7f",
    fretNumberColor: "#d2eadc",
    openFretLabelColor: "#d2eadc",
    markerColor: "#6fa587",
    markerOpacity: 0.28,
    noteFillColor: "#78d3a0",
    highlightedNoteFillColor: "#0566F0",
    noteTextColor: "#0f1714",
    fretboardPanelColor: "#101417",
  },
};

export const THEME_PRESETS = [
  {
    id: THEME_PRESET_IDS.VINTAGE_WORKSHOP,
    label: "Vintage Workshop",
    description: "Warm walnut, parchment surfaces, and brass note markers.",
    vibe: "Tactile and handcrafted",
    preview: {
      chip: "#6e4328",
      chipText: "#f8e4cc",
      panel: "#5d3a28",
    },
  },
  {
    id: THEME_PRESET_IDS.STAGE_BLACK,
    label: "Stage Black",
    description: "Graphite surfaces and amber highlights tuned for a darker, low-glare default shell.",
    vibe: "Dark and controlled",
    preview: {
      chip: "#dd9a61",
      chipText: "#121314",
      panel: "#121314",
    },
  },
  {
    id: THEME_PRESET_IDS.MODERN_LUTHIER,
    label: "Modern Luthier",
    description: "Maple, cream, and copper for a clean handcrafted-instrument feel.",
    vibe: "Warm and upscale",
    preview: {
      chip: "#a16135",
      chipText: "#fff7ec",
      panel: "#4b3429",
    },
  },
  {
    id: THEME_PRESET_IDS.NEON_FRET_LAB,
    label: "Neon Fret Lab",
    description: "Deep navy with electric accents for high-contrast pattern study.",
    vibe: "Bold and exploratory",
    preview: {
      chip: "#14d7cf",
      chipText: "#071018",
      panel: "#07111d",
    },
  },
  {
    id: THEME_PRESET_IDS.PAPER_PRACTICE_NOTEBOOK,
    label: "Paper Practice Notebook",
    description: "Notebook paper warmth with ink-blue controls and study-friendly contrast.",
    vibe: "Approachable and educational",
    preview: {
      chip: "#3a77aa",
      chipText: "#fefefe",
      panel: "#5e7488",
    },
  },
  {
    id: THEME_PRESET_IDS.STUDIO_CONSOLE,
    label: "Studio Console",
    description: "Slate surfaces and analog-green accents inspired by pro equipment.",
    vibe: "Serious and technical",
    preview: {
      chip: "#58a97f",
      chipText: "#0f1714",
      panel: "#101417",
    },
  },
];

export const FRETBOARD_VISUAL_SETTING_FIELDS = [
  {
    section: "Theme",
    fields: [
      { key: "appBackgroundColor", label: "App background", description: "Page background color for desktop and mobile.", type: "color" },
      { key: "appBackgroundAccentColor", label: "Background accent", description: "Secondary page tone used in the large background gradient.", type: "color" },
      { key: "appGlowColor", label: "Ambient glow", description: "Soft glow color used behind the main content stage.", type: "color" },
      { key: "appTextColor", label: "Primary text", description: "Default text color used across the app shell.", type: "color" },
      { key: "uiFontFamily", label: "UI font", description: "Font used by the control surfaces and general UI text.", type: "select", options: FONT_FAMILY_OPTIONS },
      { key: "surfaceColor", label: "Surface color", description: "Base fill for inputs, buttons, and chips.", type: "color" },
      { key: "surfaceStrongColor", label: "Card color", description: "Stronger surface used for cards and interior blocks.", type: "color" },
      { key: "borderColor", label: "Border color", description: "Primary border color for drawer and controls.", type: "color" },
      { key: "mutedTextColor", label: "Muted text", description: "Secondary label and helper text color.", type: "color" },
      { key: "accentColor", label: "Accent color", description: "Primary accent used for active controls.", type: "color" },
      { key: "accentStrongColor", label: "Accent shadow tone", description: "Secondary accent tone used in gradients and highlights.", type: "color" },
      { key: "accentTextColor", label: "Accent text", description: "Text color placed on accent surfaces.", type: "color" },
      { key: "drawerBackgroundStartColor", label: "Drawer gradient start", description: "Top color of the bottom drawer gradient.", type: "color" },
      { key: "drawerBackgroundEndColor", label: "Drawer gradient end", description: "Bottom color of the bottom drawer gradient.", type: "color" },
      { key: "drawerBorderColor", label: "Drawer border", description: "Border color around the bottom sheet.", type: "color" },
    ],
  },
  {
    section: "Title",
    fields: [
      { key: "titleFontFamily", label: "Title font", description: "Font used by the scale title above the fretboard.", type: "select", options: FONT_FAMILY_OPTIONS },
      { key: "titleColor", label: "Title color", description: "Color of the title text above the fretboard.", type: "color" },
      { key: "titleFontSizeDesktop", label: "Title size desktop", description: "Desktop title size in rem.", min: 1, max: 3.25, step: 0.05 },
      { key: "titleFontSizeMobile", label: "Title size mobile", description: "Mobile title size in rem.", min: 0.9, max: 2.25, step: 0.05 },
    ],
  },
  {
    section: "Panel",
    fields: [
      { key: "draggableUiMode", label: "Draggable UI mode", description: "Shows drag guides on the fretboard panel so layout edges can be adjusted directly.", type: "boolean" },
      { key: "panelPaddingX", label: "Side padding", description: "Space between the dark panel edge and the fretboard.", min: 0, max: 24, step: 1 },
      { key: "panelPaddingTop", label: "Top padding", description: "Space above the fretboard inside the dark panel.", min: 0, max: 24, step: 1 },
      { key: "panelPaddingBottom", label: "Bottom padding", description: "Space below the fretboard inside the dark panel.", min: 0, max: 24, step: 1 },
      { key: "liftPanelWithDrawer", label: "Lift panel when drawer opens", description: "Moves the fretboard panel upward when the bottom drawer opens.", type: "boolean" },
    ],
  },
  {
    section: "Board Layout",
    fields: [
      { key: "fretSpacingMode", label: "Fret spacing mode", description: "Choose between the current even fret grid and a mockup-style tapered fret layout.", type: "select", options: FRET_SPACING_MODE_OPTIONS },
      { key: "leftPad", label: "Left board padding", description: "Empty SVG space before the string lines begin.", min: 20, max: 80, step: 1 },
      { key: "topPad", label: "Top board padding", description: "Empty SVG space above the first string.", min: 0, max: 50, step: 1 },
      { key: "rightPad", label: "Right board padding", description: "Empty SVG space after the last visible fret.", min: 0, max: 40, step: 1 },
      { key: "bottomPad", label: "Bottom board padding", description: "Extra SVG room below the last string and note circles.", min: 0, max: 32, step: 1 },
      { key: "compactStringGap", label: "Dense string spacing", description: "Vertical spacing used when showing 6 or more strings.", min: 28, max: 60, step: 1 },
      { key: "standardStringGap", label: "Standard string spacing", description: "Vertical spacing used when showing 5 or fewer strings.", min: 28, max: 64, step: 1 },
      { key: "openLaneWidth", label: "Open string lane", description: "Horizontal width reserved for fret 0 when visible.", min: 0, max: 60, step: 1 },
      { key: "nutLineWidth", label: "Nut width", description: "Stroke width for the main nut and any local string nuts.", min: 2, max: 10, step: 0.25 },
      { key: "fretLineWidth", label: "Fret line width", description: "Stroke width for the other vertical fret lines.", min: 1, max: 6, step: 0.25 },
      { key: "preferredFretWidth", label: "Preferred fret spacing", description: "Base width used for each fret before compression.", min: 40, max: 90, step: 1 },
      { key: "minFretWidth", label: "Minimum fret spacing", description: "Smallest width a fret can shrink to.", min: 24, max: 60, step: 1 },
      { key: "extraFretCompression", label: "Extra fret compression", description: "How quickly fret spacing shrinks when many frets are shown.", min: 0, max: 3, step: 0.1 },
    ],
  },
  {
    section: "Labels And Notes",
    fields: [
      { key: "fretboardFontFamily", label: "Fretboard font", description: "Font used for string labels, fret numbers, and note text.", type: "select", options: FONT_FAMILY_OPTIONS },
      { key: "stringLabelColor", label: "String letter color", description: "Text color for the open-string letter labels.", type: "color" },
      { key: "stringLabelFontSize", label: "String label size", description: "Text size for the open-string labels on the left.", min: 8, max: 20, step: 0.5 },
      { key: "stringLineColor", label: "String line color", description: "Stroke color for the horizontal string lines.", type: "color" },
      { key: "fretLineColor", label: "Fret line color", description: "Stroke color for the fret dividers.", type: "color" },
      { key: "fretNumberColor", label: "Fret number color", description: "Text color for the fret numbers above the board.", type: "color" },
      { key: "fretNumberFontSize", label: "Fret number size", description: "Text size for the fret numbers above the board.", min: 8, max: 18, step: 0.5 },
      { key: "openFretLabelColor", label: "Open fret color", description: "Text color for the open-string zero marker.", type: "color" },
      { key: "openFretLabelSize", label: "Open fret size", description: "Text size for the open-string 0 marker.", min: 8, max: 18, step: 0.5 },
      { key: "markerColor", label: "Marker color", description: "Color used for fretboard dot markers.", type: "color" },
      { key: "markerOpacity", label: "Marker opacity", description: "Opacity for the fretboard markers.", min: 0, max: 1, step: 0.05 },
      { key: "noteFillColor", label: "Note fill", description: "Fill color for the note circles.", type: "color" },
      { key: "highlightedNoteFillColor", label: "Highlighted note fill", description: "Fill color for highlighted chord notes.", type: "color" },
      { key: "shortNoteRadius", label: "Short note circle size", description: "Circle size for single-character notes and intervals.", min: 6, max: 22, step: 1 },
      { key: "longNoteRadius", label: "Long note circle size", description: "Circle size for longer note labels like C# or III.", min: 8, max: 26, step: 1 },
      { key: "noteTextColor", label: "Note text color", description: "Text color inside the note circles.", type: "color" },
      { key: "shortNoteFontSize", label: "Short note text size", description: "Label size inside single-character note circles.", min: 7, max: 18, step: 0.5 },
      { key: "longNoteFontSize", label: "Long note text size", description: "Label size inside longer note circles.", min: 7, max: 18, step: 0.5 },
      { key: "fretboardPanelColor", label: "Fretboard panel", description: "Dark panel color surrounding the SVG fretboard.", type: "color" },
    ],
  },
];

export const DEFAULT_FRETBOARD_VISUAL_SETTINGS = {
  themePresetId: THEME_PRESET_IDS.VINTAGE_WORKSHOP,
  ...VINTAGE_WORKSHOP_THEME_OVERRIDES,
  draggableUiMode: false,
  panelPaddingX: 8,
  panelPaddingTop: 8,
  panelPaddingBottom: 8,
  liftPanelWithDrawer: false,
  fretSpacingMode: "uniform",
  leftPad: 44,
  topPad: 28,
  rightPad: 10,
  bottomPad: 13,
  compactStringGap: 39,
  standardStringGap: 44,
  openLaneWidth: 34,
  nutLineWidth: 4,
  fretLineWidth: 1.75,
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

const SMARTPHONE_REFERENCE_WIDTH = 430;
const SMARTPHONE_MIN_SCALE = 0.72;
// Multiplier applied to vertical/size metrics for landscape smartphones so the
// fretboard panel fills more screen height and individual elements are larger.
const LANDSCAPE_MOBILE_SCALE_BOOST = 1.4;

export function getResponsiveFretboardVisualSettings(settings, viewportWidth = SMARTPHONE_REFERENCE_WIDTH, isLandscapeSmartphone = false) {
  const normalized = normalizeFretboardVisualSettings(settings);
  const safeViewportWidth = Number.isFinite(Number(viewportWidth)) ? Number(viewportWidth) : SMARTPHONE_REFERENCE_WIDTH;
  const scale = clampNumber(safeViewportWidth / SMARTPHONE_REFERENCE_WIDTH, SMARTPHONE_MIN_SCALE, 1);
  const responsiveSettings = {
    ...normalized,
    panelPaddingX: normalized.panelPaddingX * scale,
    panelPaddingTop: normalized.panelPaddingTop * scale,
    panelPaddingBottom: normalized.panelPaddingBottom * scale,
    leftPad: normalized.leftPad * scale,
    topPad: normalized.topPad * scale,
    rightPad: normalized.rightPad * scale,
    bottomPad: normalized.bottomPad * scale,
    compactStringGap: normalized.compactStringGap * scale,
    standardStringGap: normalized.standardStringGap * scale,
    openLaneWidth: normalized.openLaneWidth * scale,
    nutLineWidth: normalized.nutLineWidth * scale,
    fretLineWidth: normalized.fretLineWidth * scale,
    preferredFretWidth: normalized.preferredFretWidth * scale,
    minFretWidth: normalized.minFretWidth * scale,
    stringLabelFontSize: normalized.stringLabelFontSize * scale,
    fretNumberFontSize: normalized.fretNumberFontSize * scale,
    openFretLabelSize: normalized.openFretLabelSize * scale,
    shortNoteRadius: normalized.shortNoteRadius * scale,
    longNoteRadius: normalized.longNoteRadius * scale,
    shortNoteFontSize: normalized.shortNoteFontSize * scale,
    longNoteFontSize: normalized.longNoteFontSize * scale,
  };

  if (!isLandscapeSmartphone) {
    return responsiveSettings;
  }

  const verticalBoost = LANDSCAPE_MOBILE_SCALE_BOOST;
  return {
    ...responsiveSettings,
    // Horizontal adjustments: reduce side padding to use more screen width.
    panelPaddingX: responsiveSettings.panelPaddingX * 0.55,
    leftPad: responsiveSettings.leftPad * 0.8,
    rightPad: responsiveSettings.rightPad * 0.55,
    openLaneWidth: responsiveSettings.openLaneWidth * 0.82,
    // Vertical/size boost: increase string spacing, note circles, fonts, and
    // inner panel padding so the fretboard panel fills more vertical space and
    // all elements are proportionally larger on the landscape mobile screen.
    panelPaddingTop: responsiveSettings.panelPaddingTop * verticalBoost,
    panelPaddingBottom: responsiveSettings.panelPaddingBottom * verticalBoost,
    topPad: responsiveSettings.topPad * verticalBoost,
    bottomPad: responsiveSettings.bottomPad * verticalBoost,
    compactStringGap: responsiveSettings.compactStringGap * verticalBoost,
    standardStringGap: responsiveSettings.standardStringGap * verticalBoost,
    nutLineWidth: responsiveSettings.nutLineWidth * 1.2,
    fretLineWidth: responsiveSettings.fretLineWidth * 1.2,
    shortNoteRadius: responsiveSettings.shortNoteRadius * verticalBoost,
    longNoteRadius: responsiveSettings.longNoteRadius * verticalBoost,
    shortNoteFontSize: responsiveSettings.shortNoteFontSize * verticalBoost,
    longNoteFontSize: responsiveSettings.longNoteFontSize * verticalBoost,
    stringLabelFontSize: responsiveSettings.stringLabelFontSize * verticalBoost,
    // Fret number and open-string labels sit at a hardcoded y=10 in the SVG,
    // so use a smaller boost to avoid clipping at the top of the viewBox.
    fretNumberFontSize: responsiveSettings.fretNumberFontSize * 1.15,
    openFretLabelSize: responsiveSettings.openFretLabelSize * 1.15,
  };
}

function isValidHexColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim());
}

export function withAlpha(hexColor, alpha) {
  if (!isValidHexColor(hexColor)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const normalized = hexColor.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function buildThemeCssVariables(settings) {
  const normalized = normalizeFretboardVisualSettings(settings);

  return {
    "--theme-app-bg": normalized.appBackgroundColor,
    "--theme-app-bg-accent": normalized.appBackgroundAccentColor,
    "--theme-app-glow": normalized.appGlowColor,
    "--theme-app-glow-soft": withAlpha(normalized.appGlowColor, 0.34),
    "--theme-app-text": normalized.appTextColor,
    "--theme-ui-font": normalized.uiFontFamily,
    "--theme-surface": normalized.surfaceColor,
    "--theme-surface-strong": normalized.surfaceStrongColor,
    "--theme-border": normalized.borderColor,
    "--theme-muted": normalized.mutedTextColor,
    "--theme-accent": normalized.accentColor,
    "--theme-accent-strong": normalized.accentStrongColor,
    "--theme-accent-text": normalized.accentTextColor,
    "--theme-drawer-start": normalized.drawerBackgroundStartColor,
    "--theme-drawer-end": normalized.drawerBackgroundEndColor,
    "--theme-drawer-border": normalized.drawerBorderColor,
    "--theme-title-font": normalized.titleFontFamily,
    "--theme-title-color": normalized.titleColor,
    "--theme-title-size-desktop": `${normalized.titleFontSizeDesktop}rem`,
    "--theme-title-size-mobile": `${normalized.titleFontSizeMobile}rem`,
    "--theme-fretboard-font": normalized.fretboardFontFamily,
    "--theme-fretboard-panel": normalized.fretboardPanelColor,
    "--theme-string-label": normalized.stringLabelColor,
    "--theme-string-line": normalized.stringLineColor,
    "--theme-fret-line": normalized.fretLineColor,
    "--theme-fret-number": normalized.fretNumberColor,
    "--theme-open-fret": normalized.openFretLabelColor,
    "--theme-marker": normalized.markerColor,
    "--theme-marker-opacity": String(normalized.markerOpacity),
    "--theme-note-fill": normalized.noteFillColor,
    "--theme-note-text": normalized.noteTextColor,
    "--theme-fretboard-shadow": withAlpha(normalized.fretboardPanelColor, 0.16),
    "--theme-selection": withAlpha(normalized.accentColor, 0.24),
  };
}

export function getThemePreset(presetId) {
  return THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0];
}

export function getThemePresetOverrides(presetId) {
  return THEME_PRESET_OVERRIDES[presetId] ?? THEME_PRESET_OVERRIDES[THEME_PRESET_IDS.VINTAGE_WORKSHOP];
}

export function applyThemePreset(settings, presetId) {
  return normalizeFretboardVisualSettings({
    ...settings,
    ...getThemePresetOverrides(presetId),
    themePresetId: presetId,
  });
}

export function detectMatchingThemePreset(settings) {
  const matchedPreset = THEME_PRESETS.find((preset) => {
    const overrides = getThemePresetOverrides(preset.id);

    return THEME_FIELD_KEYS.every((key) => settings[key] === overrides[key]);
  });

  return matchedPreset?.id ?? THEME_PRESET_IDS.CUSTOM;
}

export function isThemeSettingKey(key) {
  return THEME_FIELD_KEYS.includes(key);
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

      if (field.type === "color") {
        normalized[field.key] = isValidHexColor(merged[field.key]) ? merged[field.key].trim() : DEFAULT_FRETBOARD_VISUAL_SETTINGS[field.key];
        return;
      }

      if (field.type === "select") {
        const allowedValues = (field.options ?? []).map((option) => option.value);
        normalized[field.key] = allowedValues.includes(merged[field.key]) ? merged[field.key] : DEFAULT_FRETBOARD_VISUAL_SETTINGS[field.key];
        return;
      }

      const rawValue = Number(merged[field.key]);
      normalized[field.key] = Number.isFinite(rawValue) ? clampNumber(rawValue, field.min, field.max) : DEFAULT_FRETBOARD_VISUAL_SETTINGS[field.key];
    });
  });

  const knownThemeIds = new Set(THEME_PRESETS.map((preset) => preset.id));
  const candidateThemePresetId = typeof merged.themePresetId === "string" ? merged.themePresetId : DEFAULT_FRETBOARD_VISUAL_SETTINGS.themePresetId;
  normalized.themePresetId = knownThemeIds.has(candidateThemePresetId) ? candidateThemePresetId : DEFAULT_FRETBOARD_VISUAL_SETTINGS.themePresetId;

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

    const parsed = JSON.parse(saved);
    const normalized = normalizeFretboardVisualSettings(parsed);
    if (!parsed?.themePresetId) {
      return { ...normalized, themePresetId: detectMatchingThemePreset(normalized) };
    }

    return normalized;
  } catch {
    return DEFAULT_FRETBOARD_VISUAL_SETTINGS;
  }
}
