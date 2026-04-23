import {
  captionClassName,
  captionStyle,
  selectClassName,
  selectStyle,
  separatorClassName,
  separatorStyle,
} from "./captionSelectorStyles";

const sectionStyle = { fontFamily: "var(--theme-ui-font)" };
const noticeStyle = { color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };

function buildDisabledSelectStyle(disabled) {
  if (!disabled) {
    return selectStyle;
  }

  return {
    ...selectStyle,
    background: "color-mix(in srgb, var(--theme-surface) 88%, var(--theme-app-bg) 12%)",
    borderColor: "color-mix(in srgb, var(--theme-border) 80%, white 20%)",
    color: "var(--theme-muted)",
  };
}

export default function ChordTitleControls({
  chordId,
  chordOptions = [],
  chordStructureId,
  chordStructureOptions = [],
  displayTarget,
  displayTargets = [],
  inversionId,
  inversionOptions = [],
  notice = null,
  onChordChange,
  onChordStructureChange,
  onDisplayTargetChange,
  onInversionChange,
  onPositionStep,
  onVoicingFamilyChange,
  positionCount = 0,
  positionIndex = 0,
  positionLabel = "mid",
  voicingFamilyId,
  voicingFamilyOptions = [],
}) {
  const showChordRows = displayTarget === "Chord";
  const disabledClassName = showChordRows ? "" : "cursor-not-allowed border-[#e5ddd6] bg-[#f3ece7] text-[#aa998e] shadow-none";
  const selectedChordValue = chordId ?? chordOptions[0]?.id ?? "";
  const selectedChordStructureValue = chordStructureId ?? chordStructureOptions[0]?.id ?? "";
  const selectedVoicingFamilyValue = voicingFamilyId ?? voicingFamilyOptions[0]?.id ?? "";
  const selectedInversionValue = inversionId ?? inversionOptions[0]?.id ?? "";
  const showNotice = showChordRows && Boolean(notice);
  const positionControlsDisabled = !showChordRows || positionCount <= 0;
  const positionNavDisabled = !showChordRows || positionCount <= 1;
  const positionContainerStyle = showChordRows
    ? {
      background: "var(--theme-surface)",
      borderColor: "var(--theme-border)",
      color: "var(--theme-app-text)",
    }
    : {
        background: "color-mix(in srgb, var(--theme-surface) 88%, var(--theme-app-bg) 12%)",
        borderColor: "color-mix(in srgb, var(--theme-border) 80%, white 20%)",
        color: "var(--theme-muted)",
      };
  const positionButtonStyle = positionNavDisabled
    ? {
      background: "transparent",
      borderColor: "transparent",
        color: "var(--theme-muted)",
      opacity: 0.45,
    }
    : {
      background: "var(--theme-surface-strong)",
      borderColor: "var(--theme-border)",
      color: "var(--theme-app-text)",
      };
  const indicatorDots = Array.from({ length: positionCount }, (_, index) => ({
    id: `position-dot-${index}`,
    isActive: index === positionIndex,
  }));

  return (
    <div className="grid justify-items-center gap-1 max-[height:430px]:gap-0.5" style={sectionStyle}>
      <div className={[captionClassName, "w-full overflow-x-auto overscroll-x-contain text-center transition-opacity duration-150 opacity-100"].join(" ")} style={captionStyle}>
        <div className="compact-height-caption-row mx-auto flex min-w-max flex-wrap items-center justify-center gap-x-1.5 gap-y-1 px-1">
          <select className={selectClassName} onChange={(event) => onDisplayTargetChange(event.target.value)} style={selectStyle} value={displayTarget}>
            {displayTargets.map((target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>

          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Chord</span>
          <select className={[selectClassName, disabledClassName].join(" ").trim()} disabled={!showChordRows} onChange={(event) => onChordChange(event.target.value)} style={buildDisabledSelectStyle(!showChordRows)} tabIndex={showChordRows ? 0 : -1} value={selectedChordValue}>
            {chordOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>

          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Structure</span>
          <select className={[selectClassName, disabledClassName].join(" ").trim()} disabled={!showChordRows} onChange={(event) => onChordStructureChange(event.target.value)} style={buildDisabledSelectStyle(!showChordRows)} tabIndex={showChordRows ? 0 : -1} value={selectedChordStructureValue}>
            {chordStructureOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>

          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Voicing Family</span>
          <select className={[selectClassName, disabledClassName].join(" ").trim()} disabled={!showChordRows} onChange={(event) => onVoicingFamilyChange(event.target.value)} style={buildDisabledSelectStyle(!showChordRows)} tabIndex={showChordRows ? 0 : -1} value={selectedVoicingFamilyValue}>
            {voicingFamilyOptions.map((option) => (
              <option disabled={option.disabled} key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>

          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Inversion</span>
          <select className={[selectClassName, disabledClassName].join(" ").trim()} disabled={!showChordRows} onChange={(event) => onInversionChange(event.target.value)} style={buildDisabledSelectStyle(!showChordRows)} tabIndex={showChordRows ? 0 : -1} value={selectedInversionValue}>
            {inversionOptions.map((option) => (
              <option disabled={option.disabled} key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>

          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Position</span>
          <div className="inline-flex min-h-8 items-center gap-2 rounded-full border px-2 py-1" style={positionContainerStyle}>
            <button
              aria-label="Previous voicing position"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-[0.95rem] font-semibold leading-none transition focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/10"
              disabled={positionNavDisabled}
              onClick={() => onPositionStep(-1)}
              style={positionButtonStyle}
              tabIndex={showChordRows ? 0 : -1}
              type="button"
            >
              ←
            </button>
            <div className="flex items-center gap-1">
              {indicatorDots.length > 0 ? indicatorDots.map((dot) => (
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full border"
                  key={dot.id}
                  style={{
                    background: dot.isActive ? "var(--theme-accent)" : "transparent",
                    borderColor: dot.isActive ? "var(--theme-accent-strong)" : "var(--theme-border)",
                    opacity: positionControlsDisabled ? 0.45 : 1,
                  }}
                />
              )) : <span className="text-[0.76rem]" style={separatorStyle}>No voicings</span>}
            </div>
            <button
              aria-label="Next voicing position"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-[0.95rem] font-semibold leading-none transition focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/10"
              disabled={positionNavDisabled}
              onClick={() => onPositionStep(1)}
              style={positionButtonStyle}
              tabIndex={showChordRows ? 0 : -1}
              type="button"
            >
              →
            </button>
            <span className="rounded-full border px-2 py-0.5 text-[0.74rem] font-semibold uppercase tracking-[0.12em]" style={{ borderColor: "var(--theme-border)", background: "var(--theme-surface-strong)", color: positionControlsDisabled ? "var(--theme-muted)" : "var(--theme-app-text)", opacity: positionControlsDisabled ? 0.75 : 1 }}>
              {showChordRows ? positionLabel : "mid"}
            </span>
          </div>
        </div>
      </div>

      {showNotice ? (
        <p className="m-0 max-w-[34rem] text-center text-[0.76rem] leading-5" style={noticeStyle}>
          {notice}
        </p>
      ) : null}
    </div>
  );
}
