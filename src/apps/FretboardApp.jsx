import { useEffect, useState } from "react";
import BottomControlsSheet from "../components/BottomControlsSheet";
import ControlLayoutMockup from "../components/ControlLayoutMockup";
import ControlsPanel from "../components/ControlsPanel";
import FretboardCaptionSelectors from "../components/FretboardCaptionSelectors";
import HeroHeader from "../components/HeroHeader";
import OutputPanel from "../components/OutputPanel";
import VisualTweaksPanel from "../components/VisualTweaksPanel";
import {
  buildDownloadName,
  DISPLAY_MODES,
  INSTRUMENTS,
  NOTES_SHARP,
  renderFretboard,
  ROMAN_LABELS,
  SCALE_INTERVALS,
  toBoundedInteger,
} from "../lib/fretboard";
import {
  DEFAULT_FRETBOARD_VISUAL_SETTINGS,
  FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY,
  getSmartphoneOptimizedVisualSettings,
  loadFretboardVisualSettings,
  normalizeFretboardVisualSettings,
} from "../lib/fretboardVisualSettings";

const instrumentOptions = Object.keys(INSTRUMENTS);
const scaleOptions = Object.keys(SCALE_INTERVALS);
const defaultInstrument = instrumentOptions[0];
const defaultTuning = Object.keys(INSTRUMENTS[defaultInstrument])[0];
const FIXED_MAX_FRET = 24;
// Match Tailwind's `sm` breakpoint so the phone-specific viewer kicks in at the same width the layout starts stacking.
const SMARTPHONE_MAX_WIDTH = 640;
const MOBILE_USER_AGENT_PATTERN = /Android.+Mobile|iPhone|iPod|Windows Phone|webOS|BlackBerry|Opera Mini/i;

function detectSmartphone() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isNarrowViewport = window.innerWidth <= SMARTPHONE_MAX_WIDTH;
  const isRecognizedPhoneUserAgent = MOBILE_USER_AGENT_PATTERN.test(userAgent);

  return isRecognizedPhoneUserAgent || isNarrowViewport;
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

export default function FretboardApp() {
  const [selectedKey, setSelectedKey] = useState(NOTES_SHARP[0]);
  const [scaleName, setScaleName] = useState(scaleOptions[0]);
  const [instrument, setInstrument] = useState(defaultInstrument);
  const [tuningName, setTuningName] = useState(defaultTuning);
  const [displayMode, setDisplayMode] = useState(DISPLAY_MODES[0]);
  const [startFret, setStartFret] = useState(0);
  const [endFret, setEndFret] = useState(FIXED_MAX_FRET);
  const [noteSelections, setNoteSelections] = useState(() => ROMAN_LABELS.map(() => true));
  const [controlsOpen, setControlsOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [visualSettings, setVisualSettings] = useState(loadFretboardVisualSettings);
  const [isSmartphone, setIsSmartphone] = useState(() => detectSmartphone());

  const tuningOptions = Object.keys(INSTRUMENTS[instrument]);
  const currentTuning = INSTRUMENTS[instrument][tuningName];
  const stringCount = currentTuning.length;
  const maxFret = FIXED_MAX_FRET;

  const renderedView = renderFretboard({
    selectedKey,
    scaleName,
    instrument,
    tuningName,
    displayMode,
    startFretValue: startFret,
    endFretValue: endFret,
    highStringValue: 1,
    lowStringValue: stringCount,
    noteSelections,
  });

  useEffect(() => {
    setNoteSelections((previous) => previous.map((value, index) => (index < renderedView.scaleLength ? value : false)));
  }, [renderedView.scaleLength]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncSmartphoneState = () => setIsSmartphone(detectSmartphone());
    window.addEventListener("resize", syncSmartphoneState);

    return () => {
      window.removeEventListener("resize", syncSmartphoneState);
    };
  }, []);

  function handleInstrumentChange(nextInstrument) {
    const nextTuning = Object.keys(INSTRUMENTS[nextInstrument])[0];

    setInstrument(nextInstrument);
    setTuningName(nextTuning);
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

    Promise.resolve()
      .then(async () => {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return;
        }
        fallbackCopy(text);
      })
      .then(() => {})
      .catch(() => {
        return;
      });
  }

  function handleSave() {
    const blob = new Blob([renderedView.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = buildDownloadName(selectedKey, scaleName);
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleNoteToggle(index) {
    setNoteSelections((previous) => previous.map((value, currentIndex) => (currentIndex === index ? !value : value)));
  }

  function handleVisualSettingChange(key, value) {
    setVisualSettings((previous) => normalizeFretboardVisualSettings({ ...previous, [key]: value }));
  }

  function handleSaveVisualSettings() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY, JSON.stringify(visualSettings));
  }

  function handleResetVisualSettings() {
    setVisualSettings(DEFAULT_FRETBOARD_VISUAL_SETTINGS);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY);
    }
  }

  const shouldLiftPanelWithDrawer = visualSettings.liftPanelWithDrawer;
  const viewerLift = controlsOpen && shouldLiftPanelWithDrawer ? Math.min(Math.max(drawerHeight * 0.34, 48), 150) : 0;
  const headerTitle = `${selectedKey} ${scaleName}`;
  const hideHeader = viewerLift > 0;
  const effectiveVisualSettings = isSmartphone ? getSmartphoneOptimizedVisualSettings(visualSettings) : visualSettings;
  const controlSnapshot = {
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
  const drawerTabs = [
    {
      id: "controls",
      label: "Controls",
      content: (
        <ControlsPanel
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
          onEndFretChange={handleEndFretChange}
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
      id: "visual-tweaks",
      label: "Visual Tweaks",
      content: <VisualTweaksPanel onReset={handleResetVisualSettings} onSave={handleSaveVisualSettings} onSettingChange={handleVisualSettingChange} settings={visualSettings} />,
    },
    {
      id: "switchyard",
      label: "Switchyard",
      content: <ControlLayoutMockup state={controlSnapshot} variant="switchyard" />,
    },
    {
      id: "module-wall",
      label: "Module Wall",
      content: <ControlLayoutMockup state={controlSnapshot} variant="module-wall" />,
    },
    {
      id: "patch-bay",
      label: "Patch Bay",
      content: <ControlLayoutMockup state={controlSnapshot} variant="patch-bay" />,
    },
  ];

  return (
    // Top-level vertical spacing for the fretboard viewer stack.
    <div
      className="relative min-h-[calc(100dvh-1rem)] pt-1 sm:min-h-[calc(100dvh-1.5rem)] max-[height:430px]:min-h-[calc(100dvh-0.25rem)] max-[height:430px]:pt-0"
      style={{ paddingBottom: controlsOpen && shouldLiftPanelWithDrawer ? `${drawerHeight + 12}px` : undefined }}
    >
      <HeroHeader hidden={hideHeader} title={headerTitle} />

      <div
        className="flex min-h-[calc(100dvh-6rem)] items-center justify-center pb-5 transition-transform duration-300 ease-out sm:min-h-[calc(100dvh-7rem)] max-[height:430px]:min-h-0 max-[height:430px]:items-start max-[height:430px]:pb-2"
        style={{ transform: `translateY(-${viewerLift}px)` }}
      >
        {/* Spacing between the fretboard panel and the caption below it. */}
        <div className="grid w-full justify-items-center gap-1 px-1 sm:px-3 md:px-4 max-[height:430px]:gap-0.5 max-[height:430px]:px-0">
          <OutputPanel isSmartphone={isSmartphone} model={renderedView} visualSettings={effectiveVisualSettings} />
          <FretboardCaptionSelectors
            endFret={endFret}
            instrument={instrument}
            instrumentOptions={instrumentOptions}
            keyOptions={NOTES_SHARP}
            maxFret={maxFret}
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
      </div>

      <BottomControlsSheet
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
