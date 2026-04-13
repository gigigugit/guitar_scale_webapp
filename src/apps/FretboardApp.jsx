import { useEffect, useRef, useState } from "react";
import BottomControlsSheet from "../components/BottomControlsSheet";
import ControlLayoutMockup from "../components/ControlLayoutMockup";
import ControlsPanel from "../components/ControlsPanel";
import FretboardCaptionSelectors from "../components/FretboardCaptionSelectors";
import HeroHeader from "../components/HeroHeader";
import OutputPanel from "../components/OutputPanel";
import ThemePickerPanel from "../components/ThemePickerPanel";
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
  applyThemePreset,
  buildThemeCssVariables,
  detectMatchingThemePreset,
  DEFAULT_FRETBOARD_VISUAL_SETTINGS,
  FRETBOARD_VISUAL_SETTINGS_STORAGE_KEY,
  getResponsiveFretboardVisualSettings,
  isThemeSettingKey,
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
const COMPACT_SMARTPHONE_MAX_HEIGHT = 430;
// Covers common phone-landscape viewports so they keep the mobile fretboard layout instead of switching to the taller desktop frame.
const LANDSCAPE_SMARTPHONE_MAX_WIDTH = 950;
const LANDSCAPE_SMARTPHONE_MAX_HEIGHT = 500;
const MOBILE_USER_AGENT_PATTERN = /Android.+Mobile|iPhone|iPod|Windows Phone|webOS|BlackBerry|Opera Mini/i;
const PWA_STATUS_EVENT = "dragon-scales:pwa-status";

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
      <div className="w-full max-w-[420px] rounded-[32px] border border-[#d8c8bc] bg-[linear-gradient(180deg,rgba(255,249,242,0.98),rgba(244,234,223,0.98))] px-6 py-7 text-center shadow-[0_24px_60px_rgba(91,56,36,0.14)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#5b3824] text-[#f6debf] shadow-[0_10px_28px_rgba(91,56,36,0.2)]">
          <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
            <rect height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" width="8.5" x="7.75" y="5" />
            <path d="M6.25 11.5A5.75 5.75 0 0 1 12 5.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
            <path d="m10.5 4.8 1.9.95-1.03 1.87" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          </svg>
        </div>
        <h1 className="mb-2 mt-5 text-[1.25rem] font-semibold tracking-[-0.04em] text-[#3d291e]">Rotate Your Phone</h1>
        <p className="m-0 text-[0.96rem] leading-6 text-[#6b5649]">This view is locked to landscape on smartphones. Turn your device sideways to open the fretboard.</p>
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
      className="pointer-events-auto rounded-[22px] border px-4 py-3 shadow-[0_16px_36px_rgba(46,29,19,0.1)] backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.82)",
        borderColor: "var(--theme-border)",
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
      className="pointer-events-auto inline-flex self-center rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] shadow-[0_8px_18px_rgba(46,29,19,0.08)] backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.82)",
        borderColor: "var(--theme-border)",
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
  const viewerLift = controlsOpen && shouldLiftPanelWithDrawer ? Math.min(Math.max(drawerHeight * 0.34, 48), 150) : 0;
  const notchOnLeft = safeAreaInsets.left > safeAreaInsets.right;
  const notchOnRight = safeAreaInsets.right > safeAreaInsets.left;
  const viewerHorizontalOffset = isLandscapeSmartphone
    ? notchOnLeft
      ? `${safeAreaInsets.right / 2}px`
      : notchOnRight
        ? `${(safeAreaInsets.left / 2) * -1}px`
        : "0px"
    : "0px";
  const isLandscapeViewport = viewportWidth > viewportHeight;
  const shouldShowLandscapeGate = isSmartphone && !isLandscapeViewport;
  const shouldShowInstallPrompt = !isStandaloneMode && !installHintDismissed && (Boolean(deferredInstallPrompt) || isIOSDevice);
  const headerTitle = `${selectedKey} ${scaleName}`;
  const hideHeaderInCompactMode = isCompactSmartphone && !isLandscapeSmartphone;
  const hideHeader = viewerLift > 0 || hideHeaderInCompactMode;
  const effectiveVisualSettings = isSmartphone ? getResponsiveFretboardVisualSettings(visualSettings, viewportWidth, isLandscapeSmartphone) : visualSettings;
  const { rootClassName, viewerClassName, stackClassName } = getViewerLayoutClassNames({ isCompactSmartphone, isLandscapeSmartphone, isSmartphone });
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
      id: "themes",
      label: "Themes",
      content: <ThemePickerPanel activeThemeId={visualSettings.themePresetId} onApplyTheme={handleApplyThemePreset} onReset={handleResetVisualSettings} onSave={handleSaveVisualSettings} />,
    },
    {
      id: "visual-tweaks",
      label: "Fine Tune",
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

  if (shouldShowLandscapeGate) {
    return <RotateDeviceGate />;
  }

  return (
    // Top-level vertical spacing for the fretboard viewer stack.
    <div
      className={rootClassName}
      style={{ paddingBottom: controlsOpen && shouldLiftPanelWithDrawer ? `${drawerHeight + 12}px` : undefined }}
    >
      {shouldShowInstallPrompt || pwaStatus || isOffline ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-2.5">
          <div className="grid w-full max-w-[720px] gap-2">
            {pwaStatus ? <PwaStatusBanner onDismiss={() => setPwaStatus(null)} onRefresh={handleRefreshForUpdate} status={pwaStatus} /> : null}
            {shouldShowInstallPrompt ? <InstallPromptBanner canInstall={Boolean(deferredInstallPrompt)} isIOS={isIOSDevice} onDismiss={() => setInstallHintDismissed(true)} onInstall={handleInstallApp} /> : null}
            {isOffline ? <OfflineModePill /> : null}
          </div>
        </div>
      ) : null}
      <HeroHeader hidden={hideHeader} isSmartphone={isSmartphone} title={headerTitle} />

      <div
        className={viewerClassName}
        style={{ transform: `translate(${viewerHorizontalOffset}, -${viewerLift}px)` }}
      >
        {/* Spacing between the fretboard panel and the caption below it. */}
        <div className={stackClassName}>
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
