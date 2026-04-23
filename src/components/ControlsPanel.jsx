const fieldClassName = "h-9 w-full rounded-[12px] border px-3 text-[0.88rem] shadow-[0_2px_7px_rgba(91,56,36,0.08)] outline-none transition focus:ring-4 focus:ring-[color:var(--theme-accent)]/10 sm:h-10 sm:rounded-[14px] sm:px-3.5 sm:text-[0.92rem] md:h-11";
const buttonClassName = "h-9 rounded-full border px-3.5 text-[0.82rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/10 sm:h-10 sm:px-4 sm:text-[0.86rem]";
const primaryButtonClassName = "h-9 rounded-full border px-3.5 text-[0.82rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/15 sm:h-10 sm:px-4 sm:text-[0.86rem]";
const cardClassName = "rounded-[20px] border p-3.5 shadow-[0_10px_24px_rgba(91,56,36,0.08)] sm:rounded-[22px] sm:p-4";
const tileClassName = "rounded-[16px] border p-2.5 shadow-[0_4px_12px_rgba(91,56,36,0.05)] sm:rounded-[18px] sm:p-3";
const sectionTitleClassName = "m-0 text-[0.9rem] font-semibold uppercase tracking-[0.14em] sm:text-[0.96rem] sm:tracking-[0.15em]";
const tileLabelClassName = "block text-[0.68rem] font-semibold uppercase tracking-[0.16em] sm:text-[0.72rem] sm:tracking-[0.18em]";
const optionButtonBaseClassName = "rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold leading-none transition focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/10 sm:px-3.5 sm:py-2 sm:text-[0.85rem]";
const degreeButtonClassName = (checked, disabled) =>
  [
    "relative min-h-0 rounded-full border px-2.5 py-1.75 text-center text-[0.82rem] font-semibold leading-none shadow-[0_4px_12px_rgba(91,56,36,0.05)] transition sm:px-3 sm:py-2 sm:text-[0.9rem]",
    disabled ? "opacity-45" : "cursor-pointer hover:-translate-y-px",
  ].join(" ");

const fieldStyle = {
  background: "var(--theme-surface)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
  fontFamily: "var(--theme-ui-font)",
};
const buttonStyle = {
  background: "var(--theme-surface)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-accent)",
  fontFamily: "var(--theme-ui-font)",
};
const primaryButtonStyle = {
  background: "var(--theme-accent)",
  borderColor: "var(--theme-accent-strong)",
  color: "var(--theme-accent-text)",
  fontFamily: "var(--theme-ui-font)",
};
const cardStyle = {
  background: "var(--theme-surface-strong)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
};
const highlightCardStyle = {
  background: "linear-gradient(180deg, var(--theme-surface-strong), var(--theme-surface))",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
};
const tileStyle = {
  background: "var(--theme-surface)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
};
const sectionTitleStyle = { color: "var(--theme-app-text)", fontFamily: "var(--theme-ui-font)" };
const tileLabelStyle = { color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };
const mutedTextStyle = { color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };

const dualSliderStyles = `
  .dual-fret-slider {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 32px;
    margin: 0;
    pointer-events: none;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
  }

  .dual-fret-slider::-webkit-slider-runnable-track {
    height: 32px;
    background: transparent;
  }

  .dual-fret-slider::-moz-range-track {
    height: 32px;
    background: transparent;
    border: 0;
  }

  .dual-fret-slider::-webkit-slider-thumb {
    pointer-events: auto;
    appearance: none;
    -webkit-appearance: none;
    height: 18px;
    width: 18px;
    margin-top: 7px;
    border: 2px solid #fefaf7;
    border-radius: 9999px;
    background: var(--theme-accent);
    box-shadow: 0 2px 8px rgba(91,56,36,0.25);
    cursor: pointer;
  }

  .dual-fret-slider::-moz-range-thumb {
    pointer-events: auto;
    height: 18px;
    width: 18px;
    border: 2px solid #fefaf7;
    border-radius: 9999px;
    background: var(--theme-accent);
    box-shadow: 0 2px 8px rgba(91,56,36,0.25);
    cursor: pointer;
  }
`;

function optionButtonClassName(active) {
  return [optionButtonBaseClassName, active ? "" : "hover:-translate-y-px"].join(" ");
}

function optionButtonStyle(active) {
  return active
    ? { background: "var(--theme-accent)", borderColor: "var(--theme-accent-strong)", color: "var(--theme-accent-text)", fontFamily: "var(--theme-ui-font)" }
    : fieldStyle;
}

function degreeButtonStyle(checked, disabled) {
  if (checked && !disabled) {
    return { background: "linear-gradient(180deg, var(--theme-accent), var(--theme-accent-strong))", borderColor: "var(--theme-accent-strong)", color: "var(--theme-accent-text)", fontFamily: "var(--theme-ui-font)" };
  }

  return { background: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };
}

function FretRangeSlider({ startFret, endFret, maxFret, onStartFretChange, onEndFretChange }) {
  const startPercent = (startFret / maxFret) * 100;
  const endPercent = (endFret / maxFret) * 100;

  return (
    <div className="grid gap-3">
      <style>{dualSliderStyles}</style>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] sm:text-[0.78rem] sm:tracking-[0.16em]" style={mutedTextStyle}>
        <span>Fret Region</span>
        <div className="flex gap-2 text-[0.74rem] tracking-normal sm:text-[0.8rem]" style={{ color: "var(--theme-accent)", fontFamily: "var(--theme-ui-font)" }}>
          <span className="rounded-full border px-2.5 py-1" style={tileStyle}>Start {startFret}</span>
          <span className="rounded-full border px-2.5 py-1" style={tileStyle}>End {endFret}</span>
        </div>
      </div>

      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ background: "var(--theme-border)" }} />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--theme-accent), var(--theme-accent-strong))", left: `${startPercent}%`, width: `${Math.max(endPercent - startPercent, 0)}%` }}
        />
        <input className="dual-fret-slider" max={endFret} min={0} onChange={(event) => onStartFretChange(event.target.value)} type="range" value={startFret} />
        <input className="dual-fret-slider" max={maxFret} min={startFret} onChange={(event) => onEndFretChange(event.target.value)} type="range" value={endFret} />
      </div>

      <div className="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.14em] sm:text-[0.76rem] sm:tracking-[0.16em]" style={mutedTextStyle}>
        <span>0</span>
        <span>12</span>
        <span>{maxFret}</span>
      </div>
    </div>
  );
}

export default function ControlsPanel({
  displayTarget,
  displayTargets = [],
  selectedKey,
  scaleName,
  keyOptions = [],
  scaleOptions = [],
  noteLabels = [],
  noteSelections = [],
  scaleLength,
  onNoteToggle,
  displayMode,
  displayModes = [],
  instrument,
  instrumentOptions = [],
  tuningName,
  tuningOptions = [],
  onDisplayModeChange,
  onDisplayTargetChange,
  onInstrumentChange,
  onKeyChange,
  onTuningChange,
  onScaleChange,
  startFret,
  endFret,
  maxFret,
  onStartFretChange,
  onEndFretChange,
  onCopy,
  onSave,
  onExportSvg,
}) {
  return (
    <section className="grid gap-2.5 sm:gap-3">
      <div className="grid gap-4 xl:grid-cols-[1.28fr_0.92fr]">
        <div className="grid gap-3">
          <div className={cardClassName} style={cardStyle}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className={sectionTitleClassName} style={sectionTitleStyle}>{displayTarget === "Chord" ? "Chord Setup" : "Scale Setup"}</h3>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className={tileClassName} style={tileStyle}>
                <span className={tileLabelClassName} style={tileLabelStyle}>View</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {displayTargets.map((option) => (
                    <button key={option} className={optionButtonClassName(option === displayTarget)} onClick={() => onDisplayTargetChange(option)} style={optionButtonStyle(option === displayTarget)} type="button">
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {displayTarget === "Scale" ? (
                <>
              <label className={tileClassName} style={tileStyle}>
                <span className={tileLabelClassName} style={tileLabelStyle}>Key</span>
                <select className={[fieldClassName, "mt-2"].join(" ")} style={fieldStyle} value={selectedKey} onChange={(event) => onKeyChange(event.target.value)}>
                  {keyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={tileClassName} style={tileStyle}>
                <span className={tileLabelClassName} style={tileLabelStyle}>Scale</span>
                <select className={[fieldClassName, "mt-2"].join(" ")} style={fieldStyle} value={scaleName} onChange={(event) => onScaleChange(event.target.value)}>
                  {scaleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
                </>
              ) : (
                <div className={[tileClassName, "sm:col-span-2 xl:col-span-1"].join(" ")} style={tileStyle}>
                  <span className={tileLabelClassName} style={tileLabelStyle}>Chord Mode</span>
                    <p className="mt-2 text-[0.82rem] leading-5" style={mutedTextStyle}>Chord mode follows the selected key and scale. Use the header row to choose the chord, keep triads or sevenths selected, switch voicing families, filter the available inversions, and step through low, mid, or high positions with the arrow controls.</p>
                </div>
              )}

              <div className={tileClassName} style={tileStyle}>
                <span className={tileLabelClassName} style={tileLabelStyle}>Label Mode</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {displayModes.map((option) => (
                    <button key={option} className={optionButtonClassName(option === displayMode)} onClick={() => onDisplayModeChange(option)} style={optionButtonStyle(option === displayMode)} type="button">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-[18px] border p-3 shadow-[0_4px_12px_rgba(91,56,36,0.05)]" style={tileStyle}>
              <FretRangeSlider endFret={endFret} maxFret={maxFret} onEndFretChange={onEndFretChange} onStartFretChange={onStartFretChange} startFret={startFret} />
            </div>
          </div>

          {displayTarget === "Scale" ? (
          <div className={cardClassName} style={cardStyle}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className={sectionTitleClassName} style={sectionTitleStyle}>Interval Selector</h3>
              <p className="m-0 text-[0.84rem]" style={mutedTextStyle}>Toggle the degrees you want visible on the board.</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-7">
              {noteLabels.map((label, index) => {
                const checked = noteSelections[index];
                const disabled = index >= scaleLength;

                return (
                  <label key={label} className={degreeButtonClassName(checked, disabled)} style={degreeButtonStyle(checked, disabled)}>
                    <input
                      checked={checked}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      disabled={disabled}
                      onChange={() => onNoteToggle(index)}
                      type="checkbox"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div className={cardClassName} style={highlightCardStyle}>
            <h3 className={sectionTitleClassName} style={sectionTitleStyle}>Instrument</h3>
            <div className="mt-3 grid gap-3">
              <div>
                <span className={tileLabelClassName} style={tileLabelStyle}>Instrument</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {instrumentOptions.map((option) => (
                    <button key={option} className={optionButtonClassName(option === instrument)} onClick={() => onInstrumentChange(option)} style={optionButtonStyle(option === instrument)} type="button">
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={tileLabelClassName} style={tileLabelStyle}>Tuning</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tuningOptions.map((option) => (
                    <button key={option} className={optionButtonClassName(option === tuningName)} onClick={() => onTuningChange(option)} style={optionButtonStyle(option === tuningName)} type="button">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={cardClassName} style={highlightCardStyle}>
            <h3 className={sectionTitleClassName} style={sectionTitleStyle}>Action</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <button className={buttonClassName} onClick={onCopy} style={buttonStyle} type="button">
                Copy Tab
              </button>
              <button className={buttonClassName} onClick={onExportSvg} style={buttonStyle} type="button">
                Export SVG
              </button>
              <button className={primaryButtonClassName} onClick={onSave} style={primaryButtonStyle} type="button">
                Save Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
