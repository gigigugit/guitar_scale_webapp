import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import BottomControlsSheet from "../components/BottomControlsSheet";
import ChordTitleControls from "../components/ChordTitleControls";
import ControlLayoutMockup from "../components/ControlLayoutMockup";
import ControlsPanel from "../components/ControlsPanel";
import FretboardCaptionSelectors from "../components/FretboardCaptionSelectors";
import HeroHeader from "../components/HeroHeader";
import OutputPanel from "../components/OutputPanel";
import ThemePickerPanel from "../components/ThemePickerPanel";
import VisualTweaksPanel from "../components/VisualTweaksPanel";
import {
  getAvailableChordStructures,
  buildScaleChordOptions,
  buildDownloadName,
  DISPLAY_TARGETS,
  DISPLAY_MODES,
  getInKeyChordSelection,
  getTuningStrings,
  INSTRUMENTS,
  NOTES_SHARP,
  renderFretboard,
  ROMAN_LABELS,
  SCALE_INTERVALS,
  toBoundedInteger,
  warmChordSelectionCache,
} from "../lib/fretboard";
import {
  applyThemePreset,
  buildThemeCssVariables,
  detectMatchingThemePreset,
  serializeFretboardVisualSettings,
  DEFAULT_FRETBOARD_VISUAL_SETTINGS,
  FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY,
  getResponsiveFretboardVisualSettings,
  isThemeSettingKey,
  loadFretboardVisualSettings,
  normalizeFretboardVisualSettings,
} from "../lib/fretboardVisualSettings";
import { getGraphicFretboardMetrics } from "../components/GraphicFretboard";

const instrumentOptions = Object.keys(INSTRUMENTS);
const scaleOptions = Object.keys(SCALE_INTERVALS);
const defaultInstrument = instrumentOptions[0];
const defaultTuning = Object.keys(INSTRUMENTS[defaultInstrument])[0];
const FIXED_MAX_FRET = 18;
const INSTRUMENT_STRING_SPACING_STORAGE_KEY = "dragon-scales:instrument-string-spacing";
const MIN_INSTRUMENT_STRING_SPACING_SCALE = 0.30;
const MAX_INSTRUMENT_STRING_SPACING_SCALE = 2.00;
// Match Tailwind's `sm` breakpoint so the phone-specific viewer kicks in at the same width the layout starts stacking.
const SMARTPHONE_MAX_WIDTH = 640;
const COMPACT_SMARTPHONE_MAX_HEIGHT = 430;
// Covers common phone-landscape viewports so they keep the mobile fretboard layout instead of switching to the taller desktop frame.
const LANDSCAPE_SMARTPHONE_MAX_WIDTH = 950;
const LANDSCAPE_SMARTPHONE_MAX_HEIGHT = 500;
const MOBILE_USER_AGENT_PATTERN = /Android.+Mobile|iPhone|iPod|Windows Phone|webOS|BlackBerry|Opera Mini/i;
const PWA_STATUS_EVENT = "dragon-scales:pwa-status";
const CLOSED_CONTROLS_CLEARANCE = 72;
const OPEN_DRAWER_HEIGHT_ESTIMATE = {
  desktop: 360,
  smartphone: 300,
};
const MonacoOutputPanel = lazy(() => import("../components/MonacoOutputPanel"));
const HOW_TO_USE_COPY = [
  "Scale/Chord viewer for the guitar, banjo, and other stringed instruments to come.",
  "To use, select a scale or chord from the dropdown menu, and the fretboard will display the notes in that scale or chord. You can also change to alternate tunings via the dropdown menu, and the fretboard will update accordingly.",
  'Chords are displayed in "Chord Mode", which keeps the scale visible, highlights the chord tones, and lets you choose a voicing family, filter the available inversions, and step left or right through low, mid, and high positions without changing the manual fret range.',
];

const DEFAULT_INSTRUMENT_STRING_SPACING = Object.fromEntries(instrumentOptions.map((option) => [option, 1]));

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };

    return entities[character] ?? character;
  });
}

function clampInstrumentStringSpacing(value) {
  return Math.min(Math.max(value, MIN_INSTRUMENT_STRING_SPACING_SCALE), MAX_INSTRUMENT_STRING_SPACING_SCALE);
}

function normalizeInstrumentStringSpacing(candidate) {
  const merged = { ...DEFAULT_INSTRUMENT_STRING_SPACING, ...(candidate ?? {}) };

  return instrumentOptions.reduce((next, option) => {
    const rawValue = Number(merged[option]);
    next[option] = Number.isFinite(rawValue) ? clampInstrumentStringSpacing(rawValue) : DEFAULT_INSTRUMENT_STRING_SPACING[option];
    return next;
  }, {});
}

function loadInstrumentStringSpacing() {
  if (typeof window === "undefined") {
    return DEFAULT_INSTRUMENT_STRING_SPACING;
  }

  try {
    const saved = window.localStorage.getItem(INSTRUMENT_STRING_SPACING_STORAGE_KEY);
    if (!saved) {
      return DEFAULT_INSTRUMENT_STRING_SPACING;
    }

    return normalizeInstrumentStringSpacing(JSON.parse(saved));
  } catch {
    return DEFAULT_INSTRUMENT_STRING_SPACING;
  }
}

function buildLayoutEditorUiState({
  chordInversionId,
  chordPositionIndex,
  chordStructureId,
  chordVoicingFamilyId,
  displayMode,
  displayTarget,
  endFret,
  instrument,
  noteSelections,
  scaleName,
  selectedChordId,
  selectedKey,
  startFret,
  tuningName,
}) {
  return {
    chordInversionId,
    chordPositionIndex,
    chordStructureId,
    chordVoicingFamilyId,
    displayMode,
    displayTarget,
    endFret,
    instrument,
    noteSelections,
    scaleName,
    selectedChordId,
    selectedKey,
    startFret,
    tuningName,
  };
}

function normalizeLayoutEditorUiState(candidate, currentUiState, maxFret = FIXED_MAX_FRET) {
  const nextDisplayTarget = DISPLAY_TARGETS.includes(candidate.displayTarget)
    ? candidate.displayTarget
    : currentUiState.displayTarget;
  const nextDisplayMode = DISPLAY_MODES.includes(candidate.displayMode)
    ? candidate.displayMode
    : currentUiState.displayMode;
  const nextSelectedKey = NOTES_SHARP.includes(candidate.selectedKey)
    ? candidate.selectedKey
    : currentUiState.selectedKey;
  const nextScaleName = scaleOptions.includes(candidate.scaleName)
    ? candidate.scaleName
    : currentUiState.scaleName;
  const nextInstrument = instrumentOptions.includes(candidate.instrument)
    ? candidate.instrument
    : currentUiState.instrument;
  const nextTuningOptions = Object.keys(INSTRUMENTS[nextInstrument] ?? {});
  const nextTuningName = nextTuningOptions.includes(candidate.tuningName)
    ? candidate.tuningName
    : nextTuningOptions.includes(currentUiState.tuningName)
      ? currentUiState.tuningName
      : nextTuningOptions[0] ?? defaultTuning;
  const nextChordStructureOptions = getAvailableChordStructures(nextScaleName);
  const nextChordStructureId = nextChordStructureOptions.some((option) => option.id === candidate.chordStructureId)
    ? candidate.chordStructureId
    : nextChordStructureOptions.some((option) => option.id === currentUiState.chordStructureId)
      ? currentUiState.chordStructureId
      : nextChordStructureOptions[0]?.id ?? "triad";
  const nextChordOptions = buildScaleChordOptions(nextSelectedKey, nextScaleName, nextChordStructureId);
  const nextSelectedChordId = nextChordOptions.some((option) => option.id === candidate.selectedChordId)
    ? candidate.selectedChordId
    : nextChordOptions.some((option) => option.id === currentUiState.selectedChordId)
      ? currentUiState.selectedChordId
      : nextChordOptions[0]?.id ?? "degree-0";
  const parsedStartFret = toBoundedInteger(candidate.startFret, 0, maxFret - 1, currentUiState.startFret);
  const parsedEndFret = toBoundedInteger(candidate.endFret, 1, maxFret, currentUiState.endFret);
  const nextStartFret = Math.min(parsedStartFret, parsedEndFret - 1);
  const nextEndFret = Math.max(parsedEndFret, nextStartFret + 1);
  const rawNoteSelections = Array.isArray(candidate.noteSelections)
    ? candidate.noteSelections
    : currentUiState.noteSelections;
  const nextNoteSelections = ROMAN_LABELS.map((_, index) => Boolean(rawNoteSelections[index]));
  const nextChordPositionIndex = Math.max(
    0,
    Number.isFinite(Number(candidate.chordPositionIndex))
      ? Number.parseInt(candidate.chordPositionIndex, 10)
      : currentUiState.chordPositionIndex,
  );

  return {
    chordInversionId: candidate.chordInversionId === null || typeof candidate.chordInversionId === "string"
      ? candidate.chordInversionId
      : currentUiState.chordInversionId,
    chordPositionIndex: nextChordPositionIndex,
    chordStructureId: nextChordStructureId,
    chordVoicingFamilyId: candidate.chordVoicingFamilyId === null || typeof candidate.chordVoicingFamilyId === "string"
      ? candidate.chordVoicingFamilyId
      : currentUiState.chordVoicingFamilyId,
    displayMode: nextDisplayMode,
    displayTarget: nextDisplayTarget,
    endFret: nextEndFret,
    instrument: nextInstrument,
    noteSelections: nextNoteSelections,
    scaleName: nextScaleName,
    selectedChordId: nextSelectedChordId,
    selectedKey: nextSelectedKey,
    startFret: nextStartFret,
    tuningName: nextTuningName,
  };
}

function serializeLayoutEditorState(visualSettings, instrumentStringSpacing, uiState) {
  return JSON.stringify(
    {
      uiState,
      visualSettings,
      instrumentStringSpacing,
    },
    null,
    2,
  );
}

function parseLayoutEditorState(rawValue, currentVisualSettings, currentInstrumentStringSpacing, currentUiState, maxFret = FIXED_MAX_FRET) {
  let parsed;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Layout state must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Layout state must be a JSON object.");
  }

  const visualSettingsPatch = parsed.visualSettings ?? {};
  const instrumentStringSpacingPatch = parsed.instrumentStringSpacing ?? {};
  const uiStatePatch = parsed.uiState ?? {};

  if (typeof visualSettingsPatch !== "object" || Array.isArray(visualSettingsPatch)) {
    throw new Error("visualSettings must be a JSON object when provided.");
  }

  if (typeof instrumentStringSpacingPatch !== "object" || Array.isArray(instrumentStringSpacingPatch)) {
    throw new Error("instrumentStringSpacing must be a JSON object when provided.");
  }

  if (typeof uiStatePatch !== "object" || Array.isArray(uiStatePatch)) {
    throw new Error("uiState must be a JSON object when provided.");
  }

  const nextVisualSettings = normalizeFretboardVisualSettings({
    ...currentVisualSettings,
    ...visualSettingsPatch,
  });
  const nextUiState = normalizeLayoutEditorUiState(
    { ...currentUiState, ...uiStatePatch },
    currentUiState,
    maxFret,
  );

  return {
    instrumentStringSpacing: normalizeInstrumentStringSpacing({
      ...currentInstrumentStringSpacing,
      ...instrumentStringSpacingPatch,
    }),
    uiState: nextUiState,
    visualSettings: {
      ...nextVisualSettings,
      themePresetId: detectMatchingThemePreset(nextVisualSettings),
    },
  };
}

function parseUnsafeLayoutEditorState(rawValue, currentVisualSettings, currentInstrumentStringSpacing, currentUiState) {
  let parsed;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Layout state must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Layout state must be a JSON object.");
  }

  const visualSettingsPatch = parsed.visualSettings ?? {};
  const instrumentStringSpacingPatch = parsed.instrumentStringSpacing ?? {};
  const uiStatePatch = parsed.uiState ?? {};

  if (typeof visualSettingsPatch !== "object" || Array.isArray(visualSettingsPatch)) {
    throw new Error("visualSettings must be a JSON object when provided.");
  }

  if (typeof instrumentStringSpacingPatch !== "object" || Array.isArray(instrumentStringSpacingPatch)) {
    throw new Error("instrumentStringSpacing must be a JSON object when provided.");
  }

  if (typeof uiStatePatch !== "object" || Array.isArray(uiStatePatch)) {
    throw new Error("uiState must be a JSON object when provided.");
  }

  return {
    instrumentStringSpacing: {
      ...currentInstrumentStringSpacing,
      ...instrumentStringSpacingPatch,
    },
    uiState: {
      ...currentUiState,
      ...uiStatePatch,
    },
    visualSettings: {
      ...currentVisualSettings,
      ...visualSettingsPatch,
    },
  };
}

function measureRelativeRect(rootElement, targetElement) {
  if (!rootElement || !targetElement) {
    return null;
  }

  const rootRect = rootElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  return {
    height: targetRect.height,
    left: targetRect.left - rootRect.left,
    top: targetRect.top - rootRect.top,
    width: targetRect.width,
  };
}

function detectIPadDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  return /iPad/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
}

function parsePixelValue(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readSafeAreaInsets() {
  if (typeof window === "undefined") {
    return { bottom: 0, left: 0, right: 0, top: 0 };
  }

  const styles = window.getComputedStyle(document.documentElement);

  return {
    bottom: parsePixelValue(styles.getPropertyValue("--safe-area-bottom")),
    left: parsePixelValue(styles.getPropertyValue("--safe-area-left")),
    right: parsePixelValue(styles.getPropertyValue("--safe-area-right")),
    top: parsePixelValue(styles.getPropertyValue("--safe-area-top")),
  };
}

function detectStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function detectIOSDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return detectIPadDevice() || /iPhone|iPod/.test(navigator.userAgent);
}

function detectLandscapeSmartphone() {
  if (typeof window === "undefined") {
    return false;
  }

  const { innerWidth, innerHeight } = window;

  return innerWidth > innerHeight && innerWidth <= LANDSCAPE_SMARTPHONE_MAX_WIDTH && innerHeight <= LANDSCAPE_SMARTPHONE_MAX_HEIGHT;
}

function detectSmartphone() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isNarrowViewport = window.innerWidth <= SMARTPHONE_MAX_WIDTH;
  const isRecognizedPhoneUserAgent = MOBILE_USER_AGENT_PATTERN.test(userAgent);
  const isIPadDevice = detectIPadDevice();

  return isRecognizedPhoneUserAgent || isIPadDevice || isNarrowViewport || detectLandscapeSmartphone();
}

function detectCompactSmartphone() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerHeight <= COMPACT_SMARTPHONE_MAX_HEIGHT;
}

function fallbackCopy(text) {
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "readonly");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function copyTextToClipboard(text) {
  return Promise.resolve().then(async () => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    fallbackCopy(text);
  });
}

function getViewerLayoutClassNames({ isCompactSmartphone, isLandscapeSmartphone, isSmartphone }) {
  if (isLandscapeSmartphone) {
    return {
      rootClassName: "relative min-h-dvh pt-2",
      viewerClassName: "flex min-h-[calc(100dvh-4.25rem)] items-center justify-center pb-1.5 transition-transform duration-300 ease-out",
      stackClassName: "grid w-full justify-items-center gap-1 px-0",
    };
  }

  if (isCompactSmartphone) {
    return {
      rootClassName: "relative min-h-[calc(100dvh-0.25rem)] pt-0",
      viewerClassName: "flex min-h-[calc(100dvh-4.5rem)] items-center justify-center pb-0.5 transition-transform duration-300 ease-out",
      stackClassName: "grid w-full justify-items-center gap-0.5 px-0",
    };
  }

  if (isSmartphone) {
    return {
      rootClassName: "relative min-h-[calc(100dvh-0.5rem)] pt-0.5",
      viewerClassName: "flex min-h-[calc(100dvh-6.25rem)] items-center justify-center pb-1.5 pt-0.5 transition-transform duration-300 ease-out",
      stackClassName: "grid w-full justify-items-center gap-1.5 px-0",
    };
  }

  return {
    rootClassName: "relative min-h-[calc(100dvh-1rem)] pt-1 sm:min-h-[calc(100dvh-1.5rem)]",
    viewerClassName: "flex min-h-[calc(100dvh-6rem)] items-center justify-center pb-5 transition-transform duration-300 ease-out sm:min-h-[calc(100dvh-7rem)]",
    stackClassName: "grid w-full justify-items-center gap-1.5 px-0 sm:px-3 md:px-4",
  };
}

function RotateDeviceGate() {
  return (
    <section className="flex min-h-[100dvh] items-center justify-center px-4 py-6">
      <div
        className="w-full max-w-[420px] rounded-[32px] border px-6 py-7 text-center"
        style={{
          background: "var(--theme-surface-strong)",
          borderColor: "var(--theme-border)",
          boxShadow: "0 24px 60px var(--theme-fretboard-shadow)",
        }}
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px]"
          style={{
            background: "var(--theme-accent)",
            color: "var(--theme-accent-text)",
            boxShadow: "0 10px 28px var(--theme-fretboard-shadow)",
          }}
        >
          <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
            <rect height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" width="8.5" x="7.75" y="5" />
            <path d="M6.25 11.5A5.75 5.75 0 0 1 12 5.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
            <path d="m10.5 4.8 1.9.95-1.03 1.87" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          </svg>
        </div>
        <h1 className="mb-2 mt-5 text-[1.25rem] font-semibold tracking-[-0.04em]" style={{ color: "var(--theme-title-color)" }}>Rotate Your Phone</h1>
        <p className="m-0 text-[0.96rem] leading-6" style={{ color: "var(--theme-muted)" }}>This view is locked to landscape on smartphones. Turn your device sideways to open the fretboard.</p>
      </div>
    </section>
  );
}

function TopNoticeCard({ actions = [], description, title, tone = "neutral" }) {
  const accentStyle = {
    background: "var(--theme-accent)",
    borderColor: "var(--theme-accent-strong)",
    color: "var(--theme-accent-text)",
  };
  const neutralButtonStyle = {
    background: "var(--theme-surface)",
    borderColor: "var(--theme-border)",
    color: "var(--theme-app-text)",
  };
  const badgeStyle = tone === "accent"
    ? accentStyle
    : {
        background: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-muted)",
      };

  return (
    <div
      className="pointer-events-auto rounded-[22px] border px-4 py-3 backdrop-blur-md"
      style={{
        background: "var(--theme-surface-strong)",
        borderColor: "var(--theme-border)",
        boxShadow: "0 14px 28px var(--theme-fretboard-shadow)",
        color: "var(--theme-app-text)",
        fontFamily: "var(--theme-ui-font)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-[32rem]">
          <div className="mb-1 inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]" style={badgeStyle}>
            {tone === "accent" ? "Offline App" : "Status"}
          </div>
          <div className="text-[0.92rem] font-semibold tracking-[-0.02em]">{title}</div>
          <div className="mt-1 text-[0.8rem] leading-5" style={{ color: "var(--theme-muted)" }}>{description}</div>
        </div>

        {actions.length ? (
          <div className="flex flex-wrap gap-1.5">
            {actions.map((action) => (
              <button
                key={action.label}
                className="rounded-full border px-3 py-1.5 text-[0.74rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/12"
                onClick={action.onClick}
                style={action.primary ? accentStyle : neutralButtonStyle}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OfflineModePill() {
  return (
    <div
      className="pointer-events-auto inline-flex self-center rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] backdrop-blur-md"
      style={{
        background: "var(--theme-surface-strong)",
        borderColor: "var(--theme-border)",
        boxShadow: "0 10px 18px var(--theme-fretboard-shadow)",
        color: "var(--theme-muted)",
        fontFamily: "var(--theme-ui-font)",
      }}
    >
      Offline Mode
    </div>
  );
}

function InstallPromptBanner({ canInstall, isIOS, onDismiss, onInstall }) {
  return (
    <TopNoticeCard
      actions={canInstall ? [{ label: "Later", onClick: onDismiss }, { label: "Install", onClick: onInstall, primary: true }] : [{ label: "Dismiss", onClick: onDismiss }]}
      description={canInstall
        ? "Install Dragon Scales for one-tap launch and cached offline use after the first online visit."
        : isIOS
          ? "In Safari, tap Share and choose Add to Home Screen to keep the app available offline."
          : "Install this app from your browser menu to keep it available offline."}
      title={canInstall ? "Install for offline use" : "Add to Home Screen"}
      tone="accent"
    />
  );
}

function PwaStatusBanner({ status, onDismiss, onRefresh }) {
  if (status === "update-available") {
    return (
      <TopNoticeCard
        actions={[{ label: "Dismiss", onClick: onDismiss }, { label: "Refresh", onClick: onRefresh, primary: true }]}
        description="A newer offline bundle is ready. Refresh once to update the installed app and cache."
        title="Update available"
        tone="accent"
      />
    );
  }

  return (
    <TopNoticeCard
      actions={[{ label: "Dismiss", onClick: onDismiss }]}
      description="Dragon Scales has been cached on this device and can reopen without a network connection."
      title="Available offline"
      tone="neutral"
    />
  );
}

function HelpToast({ onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-auto w-[min(24rem,calc(100vw-2rem))] rounded-[22px] border px-4 py-3 backdrop-blur-md"
      role="status"
      style={{
        background: "var(--theme-surface-strong)",
        borderColor: "var(--theme-border)",
        boxShadow: "0 16px 32px var(--theme-fretboard-shadow)",
        color: "var(--theme-app-text)",
        fontFamily: "var(--theme-ui-font)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]" style={{ background: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-muted)" }}>
            How To Use
          </div>
          <div className="text-[0.92rem] font-semibold tracking-[-0.02em]">Quick guide</div>
        </div>
        <button
          aria-label="Dismiss help"
          className="rounded-full px-2 py-1 text-[0.85rem] font-semibold leading-none transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/12"
          onClick={onDismiss}
          style={{ color: "var(--theme-muted)" }}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="mt-2 grid gap-2 text-[0.8rem] leading-5" style={{ color: "var(--theme-muted)" }}>
        {HOW_TO_USE_COPY.map((paragraph) => (
          <p key={paragraph} className="m-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function FretboardApp() {
  const [displayTarget, setDisplayTarget] = useState(DISPLAY_TARGETS[0]);
  const [selectedKey, setSelectedKey] = useState(NOTES_SHARP[0]);
  const [scaleName, setScaleName] = useState(scaleOptions[0]);
  const [instrument, setInstrument] = useState(defaultInstrument);
  const [tuningName, setTuningName] = useState(defaultTuning);
  const [selectedChordId, setSelectedChordId] = useState("degree-0");
  const [chordStructureId, setChordStructureId] = useState("triad");
  const [chordVoicingFamilyId, setChordVoicingFamilyId] = useState(null);
  const [chordInversionId, setChordInversionId] = useState(null);
  const [chordPositionIndex, setChordPositionIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState(DISPLAY_MODES[0]);
  const [startFret, setStartFret] = useState(0);
  const [endFret, setEndFret] = useState(FIXED_MAX_FRET);
  const [noteSelections, setNoteSelections] = useState(() => ROMAN_LABELS.map(() => true));
  const [controlsOpen, setControlsOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [visualSettings, setVisualSettings] = useState(loadFretboardVisualSettings);
  const [isSmartphone, setIsSmartphone] = useState(() => detectSmartphone());
  const [isCompactSmartphone, setIsCompactSmartphone] = useState(() => detectCompactSmartphone());
  const [isLandscapeSmartphone, setIsLandscapeSmartphone] = useState(() => detectLandscapeSmartphone());
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? SMARTPHONE_MAX_WIDTH : window.innerWidth));
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window === "undefined" ? 0 : window.innerHeight));
  const [safeAreaInsets, setSafeAreaInsets] = useState(readSafeAreaInsets);
  const [isStandaloneMode, setIsStandaloneMode] = useState(detectStandaloneMode);
  const [installHintDismissed, setInstallHintDismissed] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(detectIOSDevice);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [pwaStatus, setPwaStatus] = useState(null);
  const [isOffline, setIsOffline] = useState(() => (typeof navigator === "undefined" ? false : navigator.onLine === false));
  const reloadOnControllerChangeRef = useRef(false);
  const fretboardSvgRef = useRef(null);
  const prevScaleLengthRef = useRef(null);
  const [instrumentStringSpacing, setInstrumentStringSpacing] = useState(loadInstrumentStringSpacing);
  const [layoutEditorValue, setLayoutEditorValue] = useState(() => "");
  const [layoutEditorStatus, setLayoutEditorStatus] = useState(null);
  const [layoutEditorError, setLayoutEditorError] = useState(null);
  const [isLayoutEditorVisible, setIsLayoutEditorVisible] = useState(false);
  const [isEditFocusMode, setIsEditFocusMode] = useState(false);
  const [isLayoutOverlayVisible, setIsLayoutOverlayVisible] = useState(false);
  const [isHelpToastVisible, setIsHelpToastVisible] = useState(false);
  const [layoutOverlayRects, setLayoutOverlayRects] = useState({ caption: null, panel: null, titleControls: null });
  const layoutRootRef = useRef(null);
  const titleControlsRef = useRef(null);
  const panelRegionRef = useRef(null);
  const captionSelectorsRef = useRef(null);

  const tuningOptions = useMemo(() => Object.keys(INSTRUMENTS[instrument]), [instrument]);
  const currentTuning = useMemo(() => getTuningStrings(instrument, tuningName), [instrument, tuningName]);
  const stringCount = currentTuning.length;
  const maxFret = FIXED_MAX_FRET;
  const currentLayoutEditorUiState = useMemo(() => buildLayoutEditorUiState({
    chordInversionId,
    chordPositionIndex,
    chordStructureId,
    chordVoicingFamilyId,
    displayMode,
    displayTarget,
    endFret,
    instrument,
    noteSelections,
    scaleName,
    selectedChordId,
    selectedKey,
    startFret,
    tuningName,
  }), [
    chordInversionId,
    chordPositionIndex,
    chordStructureId,
    chordVoicingFamilyId,
    displayMode,
    displayTarget,
    endFret,
    instrument,
    noteSelections,
    scaleName,
    selectedChordId,
    selectedKey,
    startFret,
    tuningName,
  ]);
  const currentUnsafeLayoutEditorState = useMemo(() => ({
    instrumentStringSpacing,
    uiState: currentLayoutEditorUiState,
    visualSettings,
  }), [currentLayoutEditorUiState, instrumentStringSpacing, visualSettings]);
  const chordStructureOptions = useMemo(() => getAvailableChordStructures(scaleName), [scaleName]);
  const resolvedChordStructureId = useMemo(() => (
    chordStructureOptions.some((option) => option.id === chordStructureId)
      ? chordStructureId
      : chordStructureOptions[0]?.id ?? "triad"
  ), [chordStructureId, chordStructureOptions]);
  const chordOptions = useMemo(
    () => buildScaleChordOptions(selectedKey, scaleName, resolvedChordStructureId),
    [resolvedChordStructureId, scaleName, selectedKey],
  );
  const chordSelection = useMemo(() => getInKeyChordSelection({
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    chordId: selectedChordId,
    chordOptions,
    chordStructureOptions,
    inversionId: chordInversionId,
    positionIndex: chordPositionIndex,
    resolveVoicings: displayTarget === "Chord",
    structureId: resolvedChordStructureId,
    voicingFamilyId: chordVoicingFamilyId,
    maxFret,
  }), [
    chordInversionId,
    chordOptions,
    chordPositionIndex,
    chordStructureOptions,
    chordVoicingFamilyId,
    displayTarget,
    instrument,
    maxFret,
    resolvedChordStructureId,
    scaleName,
    selectedChordId,
    selectedKey,
    tuningName,
  ]);

  const renderedView = useMemo(() => renderFretboard({
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    displayMode,
    displayTarget,
    startFretValue: startFret,
    endFretValue: endFret,
    highStringValue: 1,
    lowStringValue: stringCount,
    noteSelections,
    chordSelection,
  }), [
    chordSelection,
    displayMode,
    displayTarget,
    endFret,
    instrument,
    noteSelections,
    scaleName,
    selectedKey,
    startFret,
    stringCount,
    tuningName,
  ]);
  useEffect(() => {
    if (displayTarget !== "Scale") {
      prevScaleLengthRef.current = null;
      return;
    }

    const prevLength = prevScaleLengthRef.current ?? renderedView.scaleLength;
    prevScaleLengthRef.current = renderedView.scaleLength;

    setNoteSelections((previous) => previous.map((value, index) => {
      if (index >= renderedView.scaleLength) return false;
      if (index >= prevLength) return true;
      return value;
    }));
  }, [displayTarget, renderedView.scaleLength]);

  useEffect(() => {
    const warmCurrentScale = () => {
      warmChordSelectionCache({
        selectedKey,
        scaleName,
        instrument,
        tuningName,
        maxFret,
      });
    };

    if (typeof window === "undefined") {
      warmCurrentScale();
      return undefined;
    }

    if (typeof window.requestIdleCallback === "function") {
      const idleHandle = window.requestIdleCallback(() => {
        warmCurrentScale();
      }, { timeout: 250 });

      return () => {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleHandle);
        }
      };
    }

    const timeoutHandle = window.setTimeout(() => {
      warmCurrentScale();
    }, 0);

    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, [instrument, maxFret, scaleName, selectedKey, tuningName]);

  useEffect(() => {
    if (resolvedChordStructureId !== chordStructureId) {
      setChordStructureId(resolvedChordStructureId);
    }
  }, [chordStructureId, resolvedChordStructureId]);

  useEffect(() => {
    if (displayTarget !== "Chord") {
      return;
    }

    if (chordSelection.chordId !== selectedChordId) {
      setSelectedChordId(chordSelection.chordId);
    }

    if (chordSelection.voicingFamilyId !== chordVoicingFamilyId) {
      setChordVoicingFamilyId(chordSelection.voicingFamilyId);
    }

    if (chordSelection.inversionId !== chordInversionId) {
      setChordInversionId(chordSelection.inversionId);
    }

    if (chordSelection.positionIndex !== chordPositionIndex) {
      setChordPositionIndex(chordSelection.positionIndex);
    }
  }, [
    chordInversionId,
    chordPositionIndex,
    chordSelection.chordId,
    chordSelection.inversionId,
    chordSelection.positionIndex,
    chordSelection.voicingFamilyId,
    chordVoicingFamilyId,
    displayTarget,
    selectedChordId,
  ]);

  useEffect(() => {
    if (!isHelpToastVisible || typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsHelpToastVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHelpToastVisible]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncSmartphoneState = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      setSafeAreaInsets(readSafeAreaInsets());
      setIsStandaloneMode(detectStandaloneMode());
      setIsIOSDevice(detectIOSDevice());
      setIsSmartphone(detectSmartphone());
      setIsCompactSmartphone(detectCompactSmartphone());
      setIsLandscapeSmartphone(detectLandscapeSmartphone());
    };

    syncSmartphoneState();
    window.addEventListener("resize", syncSmartphoneState);

    return () => {
      window.removeEventListener("resize", syncSmartphoneState);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const variables = buildThemeCssVariables(visualSettings);
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [visualSettings]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(INSTRUMENT_STRING_SPACING_STORAGE_KEY, JSON.stringify(instrumentStringSpacing));
  }, [instrumentStringSpacing]);

  useEffect(() => {
    setLayoutEditorValue((currentValue) => {
      if (currentValue) {
        return currentValue;
      }

      return serializeLayoutEditorState(visualSettings, instrumentStringSpacing, currentLayoutEditorUiState);
    });
  }, [currentLayoutEditorUiState, instrumentStringSpacing, visualSettings]);

  useEffect(() => {
    if (!isLayoutOverlayVisible || typeof window === "undefined") {
      return undefined;
    }

    const rootElement = layoutRootRef.current;
    if (!rootElement) {
      return undefined;
    }

    const syncOverlayRects = () => {
      setLayoutOverlayRects({
        caption: measureRelativeRect(rootElement, captionSelectorsRef.current),
        panel: measureRelativeRect(rootElement, panelRegionRef.current),
        titleControls: measureRelativeRect(rootElement, titleControlsRef.current),
      });
    };

    syncOverlayRects();

    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
        syncOverlayRects();
      });

    [rootElement, titleControlsRef.current, panelRegionRef.current, captionSelectorsRef.current]
      .filter(Boolean)
      .forEach((element) => observer?.observe(element));

    window.addEventListener("resize", syncOverlayRects);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncOverlayRects);
    };
  }, [controlsOpen, drawerHeight, isEditFocusMode, isLayoutOverlayVisible, isSmartphone]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setInstallHintDismissed(true);
      setPwaStatus("offline-ready");
    };

    const handlePwaStatus = (event) => {
      const nextStatus = event.detail?.type;
      if (nextStatus === "offline-ready" || nextStatus === "update-available") {
        setPwaStatus(nextStatus);
      }
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    const handleControllerChange = () => {
      if (reloadOnControllerChangeRef.current) {
        window.location.reload();
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener(PWA_STATUS_EVENT, handlePwaStatus);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener(PWA_STATUS_EVENT, handlePwaStatus);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  useEffect(() => {
    if (pwaStatus !== "offline-ready") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPwaStatus((current) => (current === "offline-ready" ? null : current));
    }, 4800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pwaStatus]);

  function handleInstrumentChange(nextInstrument) {
    const nextTuning = Object.keys(INSTRUMENTS[nextInstrument])[0];

    setInstrument(nextInstrument);
    setTuningName(nextTuning);
  }

  function handleChordChange(nextChordId) {
    setSelectedChordId(nextChordId);
    setChordVoicingFamilyId(null);
    setChordInversionId(null);
    setChordPositionIndex(0);
  }

  function handleChordStructureChange(nextStructureId) {
    setChordStructureId(nextStructureId);
    setChordVoicingFamilyId(null);
    setChordInversionId(null);
    setChordPositionIndex(0);
  }

  function handleChordVoicingFamilyChange(nextFamilyId) {
    setChordVoicingFamilyId(nextFamilyId);
    setChordInversionId(null);
    setChordPositionIndex(0);
  }

  function handleChordInversionChange(nextInversionId) {
    setChordInversionId(nextInversionId);
    setChordPositionIndex(0);
  }

  function handleChordPositionStep(step) {
    setChordPositionIndex((current) => {
      const count = chordSelection.positionCount;

      if (count <= 0) {
        return 0;
      }

      return ((current + step) % count + count) % count;
    });
  }

  function handleStartFretChange(value) {
    const nextStart = toBoundedInteger(value, 0, maxFret - 1, startFret);

    setStartFret(nextStart);
    if (nextStart >= endFret) {
      setEndFret(Math.min(maxFret, nextStart + 1));
    }
  }

  function handleEndFretChange(value) {
    const nextEnd = toBoundedInteger(value, 1, maxFret, endFret);

    setEndFret(nextEnd);
    if (nextEnd <= startFret) {
      setStartFret(Math.max(0, nextEnd - 1));
    }
  }

  function handleCopy() {
    const text = renderedView.output;

    copyTextToClipboard(text)
      .then(() => { })
      .catch(() => {
        return;
      });
  }

  function handleCopyVisualTweaksState() {
    copyTextToClipboard(serializeLayoutEditorState(visualSettings, instrumentStringSpacing, currentLayoutEditorUiState))
      .then(() => {})
      .catch(() => {
        return;
      });
  }

  function handleLayoutEditorChange(nextValue) {
    setLayoutEditorValue(nextValue);

    if (layoutEditorError) {
      setLayoutEditorError(null);
    }

    if (layoutEditorStatus) {
      setLayoutEditorStatus(null);
    }
  }

  function handleLoadCurrentLayoutState() {
    setLayoutEditorValue(serializeLayoutEditorState(visualSettings, instrumentStringSpacing, currentLayoutEditorUiState));
    setLayoutEditorError(null);
    setLayoutEditorStatus("Loaded the current live UI and layout state.");
  }

  function handleApplyLayoutState({ save = false } = {}) {
    try {
      const nextState = parseLayoutEditorState(
        layoutEditorValue,
        visualSettings,
        instrumentStringSpacing,
        currentLayoutEditorUiState,
        maxFret,
      );
      const nextSerializedState = serializeLayoutEditorState(
        nextState.visualSettings,
        nextState.instrumentStringSpacing,
        nextState.uiState,
      );

      setDisplayTarget(nextState.uiState.displayTarget);
      setSelectedKey(nextState.uiState.selectedKey);
      setScaleName(nextState.uiState.scaleName);
      setInstrument(nextState.uiState.instrument);
      setTuningName(nextState.uiState.tuningName);
      setSelectedChordId(nextState.uiState.selectedChordId);
      setChordStructureId(nextState.uiState.chordStructureId);
      setChordVoicingFamilyId(nextState.uiState.chordVoicingFamilyId);
      setChordInversionId(nextState.uiState.chordInversionId);
      setChordPositionIndex(nextState.uiState.chordPositionIndex);
      setDisplayMode(nextState.uiState.displayMode);
      setStartFret(nextState.uiState.startFret);
      setEndFret(nextState.uiState.endFret);
      setNoteSelections(nextState.uiState.noteSelections);
      setVisualSettings(nextState.visualSettings);
      setInstrumentStringSpacing(nextState.instrumentStringSpacing);
      setLayoutEditorValue(nextSerializedState);
      setLayoutEditorError(null);
      setLayoutEditorStatus(save ? "Applied UI/layout changes and saved the persistent settings." : "Applied UI/layout changes to the live fretboard.");

      if (save && typeof window !== "undefined") {
        window.localStorage.setItem(FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY, serializeFretboardVisualSettings(nextState.visualSettings));
      }
    } catch (error) {
      setLayoutEditorStatus(null);
      setLayoutEditorError(error instanceof Error ? error.message : "Unable to apply layout state.");
    }
  }

  function handleSave() {
    const downloadName = displayTarget === "Chord" && chordSelection.available
      ? buildDownloadName(chordSelection.root, `${chordSelection.slug}-${chordSelection.variantLabel}`)
      : buildDownloadName(selectedKey, scaleName);
    const blob = new Blob([renderedView.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = downloadName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleExportSvg() {
    const svgElement = fretboardSvgRef.current;
    const metrics = getGraphicFretboardMetrics(renderedView, effectiveVisualSettings);

    if (!svgElement || !metrics) {
      return;
    }

    const panelWidth = metrics.svgWidth + effectiveVisualSettings.panelPaddingX * 2;
    const panelHeight = metrics.svgHeight + effectiveVisualSettings.panelPaddingTop + effectiveVisualSettings.panelPaddingBottom;
    const panelRadius = isSmartphone ? 30 : 38;
    const exportedInnerSvg = svgElement.cloneNode(true);
    const title = displayTarget === "Chord" && chordSelection.available
      ? `${chordSelection.displayName} ${chordSelection.variantLabel} fretboard`
      : `${selectedKey} ${scaleName} fretboard`;
    const downloadName = displayTarget === "Chord" && chordSelection.available
      ? buildDownloadName(chordSelection.root, `${chordSelection.slug}-${chordSelection.variantLabel}`)
      : buildDownloadName(selectedKey, scaleName);

    exportedInnerSvg.removeAttribute("class");
    exportedInnerSvg.removeAttribute("data-fretboard-svg");
    exportedInnerSvg.removeAttribute("ref");
    exportedInnerSvg.removeAttribute("role");
    exportedInnerSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    exportedInnerSvg.setAttribute("width", String(metrics.svgWidth));
    exportedInnerSvg.setAttribute("height", String(metrics.svgHeight));

    const svgMarkup = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${panelWidth}" height="${panelHeight}" viewBox="0 0 ${panelWidth} ${panelHeight}">`,
      `  <title>${escapeXml(title)}</title>`,
      `  <rect width="${panelWidth}" height="${panelHeight}" rx="${panelRadius}" fill="${effectiveVisualSettings.fretboardPanelColor}" />`,
      `  <g transform="translate(${effectiveVisualSettings.panelPaddingX} ${effectiveVisualSettings.panelPaddingTop})">`,
      exportedInnerSvg.innerHTML,
      "  </g>",
      "</svg>",
    ].join("\n");

    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = downloadName.replace(/\.txt$/, ".svg");
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleNoteToggle(index) {
    setNoteSelections((previous) => previous.map((value, currentIndex) => (currentIndex === index ? !value : value)));
  }

  function handleVisualSettingChange(key, value) {
    setVisualSettings((previous) => {
      const nextSettings = normalizeFretboardVisualSettings({ ...previous, [key]: value });

      return {
        ...nextSettings,
        themePresetId: isThemeSettingKey(key) ? detectMatchingThemePreset(nextSettings) : previous.themePresetId,
      };
    });
  }

  function handleApplyThemePreset(presetId) {
    setVisualSettings((previous) => applyThemePreset(previous, presetId));
  }

  function handleInstrumentStringSpacingChange(value) {
    const nextValue = clampInstrumentStringSpacing(Number(value));

    setInstrumentStringSpacing((previous) => ({
      ...previous,
      [instrument]: Number.isFinite(nextValue) ? nextValue : previous[instrument] ?? 1,
    }));
  }

  function handleSaveVisualSettings() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY, serializeFretboardVisualSettings(visualSettings));
  }

  function handleResetVisualSettings() {
    setVisualSettings(DEFAULT_FRETBOARD_VISUAL_SETTINGS);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY);
    }
  }

  async function handleInstallApp() {
    if (!deferredInstallPrompt) {
      return;
    }

    const promptEvent = deferredInstallPrompt;
    setDeferredInstallPrompt(null);

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice?.outcome !== "accepted") {
        setInstallHintDismissed(true);
      }
    } catch {
      setInstallHintDismissed(true);
    }
  }

  async function handleRefreshForUpdate() {
    if (!("serviceWorker" in navigator)) {
      window.location.reload();
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      reloadOnControllerChangeRef.current = true;
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    window.location.reload();
  }

  const shouldLiftPanelWithDrawer = visualSettings.liftPanelWithDrawer;
  const estimatedDrawerHeight = isSmartphone ? OPEN_DRAWER_HEIGHT_ESTIMATE.smartphone : OPEN_DRAWER_HEIGHT_ESTIMATE.desktop;
  const effectiveDrawerHeight = controlsOpen ? Math.max(drawerHeight, estimatedDrawerHeight) : 0;
  const viewerLift = controlsOpen && shouldLiftPanelWithDrawer ? Math.min(Math.max(effectiveDrawerHeight * 0.34, 48), 150) : 0;
  const viewerHorizontalPadding = isLandscapeSmartphone ? `${Math.max(safeAreaInsets.left, safeAreaInsets.right)}px` : undefined;
  const isLandscapeViewport = viewportWidth > viewportHeight;
  const shouldShowLandscapeGate = isSmartphone && !isLandscapeViewport;
  const shouldShowInstallPrompt = !isStandaloneMode && !installHintDismissed && (Boolean(deferredInstallPrompt) || isIOSDevice);
  const headerTitle = displayTarget === "Chord" ? `${selectedKey} ${scaleName} Chords` : `${selectedKey} ${scaleName}`;
  const hideHeaderInCompactMode = isCompactSmartphone && !isLandscapeSmartphone;
  const hideHeader = viewerLift > 0 || hideHeaderInCompactMode || isEditFocusMode;
  const currentInstrumentStringSpacing = instrumentStringSpacing[instrument] ?? 1;
  const effectiveVisualSettingsBase = isSmartphone ? getResponsiveFretboardVisualSettings(visualSettings, viewportWidth, isLandscapeSmartphone) : visualSettings;
  const effectiveVisualSettings = { ...effectiveVisualSettingsBase, instrumentStringSpacingScale: currentInstrumentStringSpacing };
  const layoutEditorPreview = useMemo(() => {
    if (!isLayoutEditorVisible || isSmartphone) {
      return {
        error: null,
        previewVisualSettings: effectiveVisualSettings,
        state: currentUnsafeLayoutEditorState,
        view: renderedView,
      };
    }

    try {
      const nextState = parseUnsafeLayoutEditorState(
        layoutEditorValue,
        visualSettings,
        instrumentStringSpacing,
        currentLayoutEditorUiState,
      );
      const previewInstrument = nextState.uiState.instrument;
      const previewTuningName = nextState.uiState.tuningName;
      const previewScaleName = nextState.uiState.scaleName;
      const previewSelectedKey = nextState.uiState.selectedKey;
      const previewDisplayTarget = nextState.uiState.displayTarget;
      const previewDisplayMode = nextState.uiState.displayMode;
      const previewChordStructureId = nextState.uiState.chordStructureId;
      const previewTuning = getTuningStrings(previewInstrument, previewTuningName);
      const previewStringCount = previewTuning.length;
      const previewChordStructureOptions = getAvailableChordStructures(previewScaleName);
      const previewChordOptions = buildScaleChordOptions(previewSelectedKey, previewScaleName, previewChordStructureId);
      const previewChordSelection = getInKeyChordSelection({
        selectedKey: previewSelectedKey,
        scaleName: previewScaleName,
        instrument: previewInstrument,
        tuningName: previewTuningName,
        chordId: nextState.uiState.selectedChordId,
        chordOptions: previewChordOptions,
        chordStructureOptions: previewChordStructureOptions,
        inversionId: nextState.uiState.chordInversionId,
        positionIndex: nextState.uiState.chordPositionIndex,
        resolveVoicings: previewDisplayTarget === "Chord",
        structureId: previewChordStructureId,
        voicingFamilyId: nextState.uiState.chordVoicingFamilyId,
        maxFret,
      });
      const previewView = renderFretboard({
        selectedKey: previewSelectedKey,
        scaleName: previewScaleName,
        instrument: previewInstrument,
        tuningName: previewTuningName,
        displayMode: previewDisplayMode,
        displayTarget: previewDisplayTarget,
        startFretValue: nextState.uiState.startFret,
        endFretValue: nextState.uiState.endFret,
        highStringValue: 1,
        lowStringValue: previewStringCount,
        noteSelections: nextState.uiState.noteSelections,
        chordSelection: previewChordSelection,
      });
      const previewInstrumentStringSpacing = nextState.instrumentStringSpacing?.[previewInstrument] ?? 1;
      const previewVisualSettingsBase = isSmartphone
        ? getResponsiveFretboardVisualSettings(nextState.visualSettings, viewportWidth, isLandscapeSmartphone)
        : nextState.visualSettings;

      return {
        error: null,
        previewVisualSettings: {
          ...previewVisualSettingsBase,
          instrumentStringSpacingScale: previewInstrumentStringSpacing,
        },
        state: nextState,
        view: previewView,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unsafe preview failed.",
        previewVisualSettings: effectiveVisualSettings,
        state: currentUnsafeLayoutEditorState,
        view: null,
      };
    }
  }, [
    currentLayoutEditorUiState,
    currentUnsafeLayoutEditorState,
    effectiveVisualSettings,
    instrumentStringSpacing,
    isLandscapeSmartphone,
    isLayoutEditorVisible,
    isSmartphone,
    layoutEditorValue,
    maxFret,
    renderedView,
    viewportWidth,
    visualSettings,
  ]);
  const { rootClassName, viewerClassName, stackClassName } = getViewerLayoutClassNames({ isCompactSmartphone, isLandscapeSmartphone, isSmartphone });
  const controlSnapshot = {
    displayTarget,
    displayMode,
    displayModes: DISPLAY_MODES,
    endFret,
    highString: 1,
    instrument,
    lowString: stringCount,
    maxFret,
    noteLabels: ROMAN_LABELS,
    noteSelections,
    scaleLength: renderedView.scaleLength,
    scaleName,
    selectedKey,
    startFret,
    tuningName,
  };
  const drawerTabs = useMemo(() => [
    {
      id: "controls",
      label: "Controls",
      renderContent: () => (
        <ControlsPanel
          displayTarget={displayTarget}
          displayTargets={DISPLAY_TARGETS}
          displayMode={displayMode}
          displayModes={DISPLAY_MODES}
          endFret={endFret}
          instrument={instrument}
          instrumentOptions={instrumentOptions}
          keyOptions={NOTES_SHARP}
          maxFret={maxFret}
          noteLabels={ROMAN_LABELS}
          noteSelections={noteSelections}
          onCopy={handleCopy}
          onDisplayModeChange={setDisplayMode}
          onDisplayTargetChange={setDisplayTarget}
          onEndFretChange={handleEndFretChange}
          onExportSvg={handleExportSvg}
          onInstrumentChange={handleInstrumentChange}
          onKeyChange={setSelectedKey}
          onNoteToggle={handleNoteToggle}
          onSave={handleSave}
          onScaleChange={setScaleName}
          onStartFretChange={handleStartFretChange}
          onTuningChange={setTuningName}
          scaleLength={renderedView.scaleLength}
          scaleName={scaleName}
          scaleOptions={scaleOptions}
          selectedKey={selectedKey}
          startFret={startFret}
          tuningName={tuningName}
          tuningOptions={tuningOptions}
        />
      ),
    },
    {
      id: "themes",
      label: "Themes",
      renderContent: () => <ThemePickerPanel activeThemeId={visualSettings.themePresetId} onApplyTheme={handleApplyThemePreset} onReset={handleResetVisualSettings} onSave={handleSaveVisualSettings} />,
    },
    {
      id: "visual-tweaks",
      label: "Visual Tweaks",
      allowPartialCollapse: true,
      partialCollapseTitle: "Visual Tweaks",
      renderContent: () => (
        <VisualTweaksPanel
          isDesktop={!isSmartphone}
          isEditFocusMode={isEditFocusMode}
          instrument={instrument}
          instrumentStringSpacing={currentInstrumentStringSpacing}
          isLayoutEditorVisible={isLayoutEditorVisible}
          isLayoutOverlayVisible={isLayoutOverlayVisible}
          onCopyState={handleCopyVisualTweaksState}
          onInstrumentStringSpacingChange={handleInstrumentStringSpacingChange}
          onReset={handleResetVisualSettings}
          onSave={handleSaveVisualSettings}
          onSettingChange={handleVisualSettingChange}
          onToggleEditFocusMode={() => setIsEditFocusMode((current) => !current)}
          onToggleLayoutEditor={() => setIsLayoutEditorVisible((current) => !current)}
          onToggleLayoutOverlay={() => setIsLayoutOverlayVisible((current) => !current)}
          settings={visualSettings}
          stringSpacingMax={MAX_INSTRUMENT_STRING_SPACING_SCALE}
          stringSpacingMin={MIN_INSTRUMENT_STRING_SPACING_SCALE}
        />
      ),
    },
    {
      id: "switchyard",
      label: "Switchyard",
      renderContent: () => <ControlLayoutMockup state={controlSnapshot} variant="switchyard" />,
    },
    {
      id: "module-wall",
      label: "Module Wall",
      renderContent: () => <ControlLayoutMockup state={controlSnapshot} variant="module-wall" />,
    },
    {
      id: "patch-bay",
      label: "Patch Bay",
      renderContent: () => <ControlLayoutMockup state={controlSnapshot} variant="patch-bay" />,
    },
  ], [
    controlSnapshot,
    currentInstrumentStringSpacing,
    displayMode,
    displayTarget,
    endFret,
    handleCopy,
    handleCopyVisualTweaksState,
    handleEndFretChange,
    handleExportSvg,
    handleInstrumentChange,
    handleResetVisualSettings,
    handleSave,
    handleSaveVisualSettings,
    handleStartFretChange,
    handleVisualSettingChange,
    instrument,
    instrumentOptions,
    isEditFocusMode,
    isLayoutEditorVisible,
    isLayoutOverlayVisible,
    isSmartphone,
    noteSelections,
    renderedView.scaleLength,
    scaleName,
    selectedKey,
    startFret,
    tuningName,
    tuningOptions,
    visualSettings,
  ]);

  if (shouldShowLandscapeGate) {
    return <RotateDeviceGate />;
  }

  return (
    // Top-level vertical spacing for the fretboard viewer stack.
    <div
      className={rootClassName}
      ref={layoutRootRef}
      style={{
        paddingBottom: controlsOpen && shouldLiftPanelWithDrawer
          ? `${effectiveDrawerHeight + 12}px`
          : `${CLOSED_CONTROLS_CLEARANCE}px`,
      }}
    >
      {isLayoutOverlayVisible && !isSmartphone ? (
        <>
          <div className="pointer-events-none absolute inset-0 z-30">
            {layoutOverlayRects.titleControls ? (
              <div
                className="absolute rounded-[20px] border-2 border-dashed"
                style={{
                  borderColor: "rgba(38, 132, 255, 0.88)",
                  height: `${layoutOverlayRects.titleControls.height}px`,
                  left: `${layoutOverlayRects.titleControls.left}px`,
                  top: `${layoutOverlayRects.titleControls.top}px`,
                  width: `${layoutOverlayRects.titleControls.width}px`,
                }}
              >
                <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]" style={{ background: "rgba(38,132,255,0.92)", color: "white" }}>
                  Title / context row
                </div>
              </div>
            ) : null}
            {layoutOverlayRects.panel ? (
              <div
                className="absolute rounded-[26px] border-2 border-dashed"
                style={{
                  borderColor: "rgba(0, 187, 125, 0.88)",
                  height: `${layoutOverlayRects.panel.height}px`,
                  left: `${layoutOverlayRects.panel.left}px`,
                  top: `${layoutOverlayRects.panel.top}px`,
                  width: `${layoutOverlayRects.panel.width}px`,
                }}
              >
                <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]" style={{ background: "rgba(0,187,125,0.94)", color: "white" }}>
                  Fretboard panel
                </div>
              </div>
            ) : null}
            {layoutOverlayRects.caption ? (
              <div
                className="absolute rounded-[18px] border-2 border-dashed"
                style={{
                  borderColor: "rgba(255, 145, 0, 0.9)",
                  height: `${layoutOverlayRects.caption.height}px`,
                  left: `${layoutOverlayRects.caption.left}px`,
                  top: `${layoutOverlayRects.caption.top}px`,
                  width: `${layoutOverlayRects.caption.width}px`,
                }}
              >
                <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]" style={{ background: "rgba(255,145,0,0.94)", color: "white" }}>
                  Caption / selector row
                </div>
              </div>
            ) : null}
          </div>
          <div className="pointer-events-none fixed bottom-6 right-6 z-40 max-w-[22rem] rounded-[20px] border px-4 py-3 text-[0.78rem] leading-5" style={{ background: "var(--theme-surface-strong)", borderColor: "var(--theme-border)", boxShadow: "0 16px 32px var(--theme-fretboard-shadow)", color: "var(--theme-app-text)" }}>
            <div className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
              Live Layout Overlay
            </div>
            Blue marks the title/context row, green marks the fretboard panel, orange marks the selector row, and the bottom controls sheet remains pinned to the viewport bottom.
          </div>
        </>
      ) : null}
      {shouldShowInstallPrompt || pwaStatus || isOffline ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-2.5">
          <div className="grid w-full max-w-[720px] gap-2">
            {pwaStatus ? <PwaStatusBanner onDismiss={() => setPwaStatus(null)} onRefresh={handleRefreshForUpdate} status={pwaStatus} /> : null}
            {shouldShowInstallPrompt ? <InstallPromptBanner canInstall={Boolean(deferredInstallPrompt)} isIOS={isIOSDevice} onDismiss={() => setInstallHintDismissed(true)} onInstall={handleInstallApp} /> : null}
            {isOffline ? <OfflineModePill /> : null}
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none fixed right-3 top-3 z-50 flex flex-col items-end gap-2 sm:right-4 sm:top-4">
        <button
          className="pointer-events-auto bg-transparent p-0 text-[0.78rem] font-semibold tracking-[0.01em] underline underline-offset-4 transition hover:opacity-70 focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/12"
          onClick={() => setIsHelpToastVisible((current) => !current)}
          style={{ color: "var(--theme-app-text)", fontFamily: "var(--theme-ui-font)" }}
          type="button"
        >
          {isHelpToastVisible ? "Hide help" : "How to use"}
        </button>

        {isHelpToastVisible ? <HelpToast onDismiss={() => setIsHelpToastVisible(false)} /> : null}
      </div>
      <div className="absolute inset-x-0 top-0 z-20">
        <HeroHeader hidden={hideHeader} isSmartphone={isSmartphone} title={headerTitle} />
      </div>
      <div
        className={viewerClassName}
        style={{ paddingLeft: viewerHorizontalPadding, paddingRight: viewerHorizontalPadding, transform: `translateY(-${viewerLift}px)` }}
      >
        <div className={stackClassName}>
          {!isEditFocusMode ? (
            <div ref={titleControlsRef}>
              <HeroHeader hidden={hideHeader} isSmartphone={isSmartphone} showTitle={false} title={headerTitle}>
                <ChordTitleControls
                  chordId={selectedChordId}
                  chordOptions={chordOptions}
                  chordStructureId={resolvedChordStructureId}
                  chordStructureOptions={chordStructureOptions}
                  displayTarget={displayTarget}
                  displayTargets={DISPLAY_TARGETS}
                  inversionId={chordSelection.inversionId}
                  inversionOptions={chordSelection.inversionOptions}
                  notice={displayTarget === "Chord" ? chordSelection.notice : null}
                  onChordChange={handleChordChange}
                  onDisplayTargetChange={setDisplayTarget}
                  onChordStructureChange={handleChordStructureChange}
                  onInversionChange={handleChordInversionChange}
                  onPositionStep={handleChordPositionStep}
                  onVoicingFamilyChange={handleChordVoicingFamilyChange}
                  positionCount={chordSelection.positionCount}
                  positionIndex={chordSelection.positionIndex}
                  positionLabel={chordSelection.positionLabel}
                  voicingFamilyId={chordSelection.voicingFamilyId}
                  voicingFamilyOptions={chordSelection.voicingFamilyOptions}
                />
              </HeroHeader>
            </div>
          ) : null}
          <div className="w-full" ref={panelRegionRef}>
            {!isSmartphone && isLayoutEditorVisible ? (
              <div className="grid w-full items-start gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
                <div className="min-w-0">
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3" style={{ background: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-app-text)" }}>
                    <div>
                      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
                        Draft Preview
                      </div>
                      <div className="text-[0.92rem] font-semibold tracking-[-0.02em]" style={{ color: "var(--theme-title-color)" }}>
                        Unsafe Monaco state
                      </div>
                    </div>
                    <div className="max-w-[18rem] text-right text-[0.76rem] leading-5" style={{ color: "var(--theme-muted)" }}>
                      This panel updates from the editor immediately and can fail independently of the saved app state.
                    </div>
                  </div>
                  {layoutEditorPreview.view ? (
                    <div className="flex w-full justify-center">
                      <OutputPanel
                        baseVisualSettings={layoutEditorPreview.state.visualSettings}
                        isEditFocusMode={isEditFocusMode}
                        isSmartphone={isSmartphone}
                        model={layoutEditorPreview.view}
                        onVisualSettingChange={handleVisualSettingChange}
                        showLayoutOverlay={isLayoutOverlayVisible}
                        svgRef={fretboardSvgRef}
                        visualSettings={layoutEditorPreview.previewVisualSettings}
                      />
                    </div>
                  ) : (
                    <section
                      className="mx-auto w-[min(100%,1260px)] overflow-hidden rounded-[18px] border px-5 py-5"
                      style={{
                        background: "var(--theme-surface-strong)",
                        borderColor: "rgba(140, 27, 27, 0.22)",
                        boxShadow: "0 20px 48px var(--theme-fretboard-shadow)",
                      }}
                    >
                      <div className="mb-2 text-[0.74rem] font-semibold uppercase tracking-[0.16em]" style={{ color: "#8c1b1b" }}>
                        Preview Error
                      </div>
                      <div className="text-[0.92rem] font-semibold tracking-[-0.02em]" style={{ color: "var(--theme-title-color)" }}>
                        The unsafe draft could not be rendered.
                      </div>
                      <p className="mb-0 mt-2 text-[0.84rem] leading-6" style={{ color: "var(--theme-muted)" }}>
                        {layoutEditorPreview.error ?? "Unsafe preview failed."}
                      </p>
                    </section>
                  )}
                </div>
                <Suspense
                  fallback={(
                    <div
                      className="rounded-[28px] border px-4 py-5 text-[0.84rem]"
                      style={{
                        background: "var(--theme-surface-strong)",
                        borderColor: "var(--theme-border)",
                        boxShadow: "0 18px 42px var(--theme-fretboard-shadow)",
                        color: "var(--theme-muted)",
                      }}
                    >
                      Loading Monaco editor...
                    </div>
                  )}
                >
                  <MonacoOutputPanel
                    errorMessage={layoutEditorError}
                    onApply={() => handleApplyLayoutState()}
                    onApplyAndSave={() => handleApplyLayoutState({ save: true })}
                    onChange={handleLayoutEditorChange}
                    onCopyCurrent={handleCopyVisualTweaksState}
                    onLoadCurrent={handleLoadCurrentLayoutState}
                    previewErrorMessage={layoutEditorPreview.error}
                    statusMessage={layoutEditorStatus}
                    value={layoutEditorValue}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="flex w-full justify-center">
                <OutputPanel
                  baseVisualSettings={visualSettings}
                  isEditFocusMode={isEditFocusMode}
                  isSmartphone={isSmartphone}
                  model={renderedView}
                  onVisualSettingChange={handleVisualSettingChange}
                  showLayoutOverlay={isLayoutOverlayVisible}
                  svgRef={fretboardSvgRef}
                  visualSettings={effectiveVisualSettings}
                />
              </div>
            )}
          </div>
          {!isEditFocusMode ? (
            <div ref={captionSelectorsRef}>
              <FretboardCaptionSelectors
                displayMode={displayMode}
                displayModes={DISPLAY_MODES}
                endFret={endFret}
                instrument={instrument}
                instrumentOptions={instrumentOptions}
                keyOptions={NOTES_SHARP}
                maxFret={maxFret}
                onDisplayModeChange={setDisplayMode}
                onEndFretChange={handleEndFretChange}
                onInstrumentChange={handleInstrumentChange}
                onKeyChange={setSelectedKey}
                onScaleChange={setScaleName}
                onStartFretChange={handleStartFretChange}
                onTuningChange={setTuningName}
                scaleName={scaleName}
                scaleOptions={scaleOptions}
                selectedKey={selectedKey}
                startFret={startFret}
                tuningName={tuningName}
                tuningOptions={tuningOptions}
              />
            </div>
          ) : null}
        </div>
      </div>

      <BottomControlsSheet
        isSmartphone={isSmartphone}
        isOpen={controlsOpen}
        onHeightChange={setDrawerHeight}
        tabs={drawerTabs}
        onToggle={() => setControlsOpen((current) => !current)}
      >
        {drawerTabs[0].content}
      </BottomControlsSheet>
    </div>
  );
}
