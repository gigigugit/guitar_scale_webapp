const fieldClassName = "h-10 w-full rounded-[14px] border border-[#d8cec4] bg-[#fbf8f4] px-3.5 text-[0.92rem] text-[#3a2b22] shadow-[0_2px_7px_rgba(91,56,36,0.08)] outline-none transition focus:border-[#8a6a55] focus:ring-4 focus:ring-[#5b3824]/10 md:h-11";
const buttonClassName = "h-10 rounded-full border border-[#d8cec4] bg-[#fbf8f4] px-4 text-[0.86rem] font-semibold text-[#5b3824] transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10";
const primaryButtonClassName = "h-10 rounded-full border border-[#6a4531] bg-[#5b3824] px-4 text-[0.86rem] font-semibold text-[#f8dfc3] transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[#5b3824]/15";
const cardClassName = "rounded-[22px] border border-[#dccdc1] bg-[rgba(255,255,255,0.62)] p-4 shadow-[0_10px_24px_rgba(91,56,36,0.08)]";
const tileClassName = "rounded-[18px] border border-[#dfd2c7] bg-[#fffaf6] p-3 shadow-[0_4px_12px_rgba(91,56,36,0.05)]";
const sectionTitleClassName = "m-0 text-[0.96rem] font-semibold uppercase tracking-[0.15em] text-[#5a4030]";
const tileLabelClassName = "block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8b7668]";
const optionButtonBaseClassName = "rounded-full border px-3.5 py-2 text-[0.85rem] font-semibold leading-none transition focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10";
const degreeButtonClassName = (checked, disabled) =>
  [
    "relative min-h-0 rounded-full border px-3 py-2 text-center text-[0.9rem] font-semibold leading-none shadow-[0_4px_12px_rgba(91,56,36,0.05)] transition",
    checked && !disabled
      ? "border-[#7c5843] bg-[linear-gradient(180deg,rgba(91,56,36,0.92),rgba(115,74,51,0.92))] text-[#f7dcc0]"
      : "border-[#ded2c7] bg-[#fffaf6] text-[#6f5c50]",
    disabled ? "opacity-45" : "cursor-pointer hover:-translate-y-px",
  ].join(" ");

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
    background: #5b3824;
    box-shadow: 0 2px 8px rgba(91,56,36,0.25);
    cursor: pointer;
  }

  .dual-fret-slider::-moz-range-thumb {
    pointer-events: auto;
    height: 18px;
    width: 18px;
    border: 2px solid #fefaf7;
    border-radius: 9999px;
    background: #5b3824;
    box-shadow: 0 2px 8px rgba(91,56,36,0.25);
    cursor: pointer;
  }
`;

function optionButtonClassName(active) {
  return [
    optionButtonBaseClassName,
    active ? "border-[#7c5843] bg-[#5b3824] text-[#f7dcc0]" : "border-[#d8cec4] bg-[#fbf8f4] text-[#5b3824] hover:-translate-y-px",
  ].join(" ");
}

function FretRangeSlider({ startFret, endFret, maxFret, onStartFretChange, onEndFretChange }) {
  const startPercent = (startFret / maxFret) * 100;
  const endPercent = (endFret / maxFret) * 100;

  return (
    <div className="grid gap-3">
      <style>{dualSliderStyles}</style>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8c7769]">
        <span>Fret Region</span>
        <div className="flex gap-2 text-[0.8rem] tracking-normal text-[#5b3824]">
          <span className="rounded-full border border-[#d9cbc0] bg-[#fffaf6] px-2.5 py-1">Start {startFret}</span>
          <span className="rounded-full border border-[#d9cbc0] bg-[#fffaf6] px-2.5 py-1">End {endFret}</span>
        </div>
      </div>

      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#e5d8cd]" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#7c5843,#b57b54)]"
          style={{ left: `${startPercent}%`, width: `${Math.max(endPercent - startPercent, 0)}%` }}
        />
        <input className="dual-fret-slider" max={endFret} min={0} onChange={(event) => onStartFretChange(event.target.value)} type="range" value={startFret} />
        <input className="dual-fret-slider" max={maxFret} min={startFret} onChange={(event) => onEndFretChange(event.target.value)} type="range" value={endFret} />
      </div>

      <div className="flex items-center justify-between text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-[#9a8373]">
        <span>0</span>
        <span>12</span>
        <span>{maxFret}</span>
      </div>
    </div>
  );
}

export default function ControlsPanel({
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
}) {
  return (
    <section className="grid gap-3">
      <div className="grid gap-4 xl:grid-cols-[1.28fr_0.92fr]">
        <div className="grid gap-3">
          <div className={cardClassName}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className={sectionTitleClassName}>Scale Setup</h3>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className={tileClassName}>
                <span className={tileLabelClassName}>Key</span>
                <select className={[fieldClassName, "mt-2"].join(" ")} value={selectedKey} onChange={(event) => onKeyChange(event.target.value)}>
                  {keyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={tileClassName}>
                <span className={tileLabelClassName}>Scale</span>
                <select className={[fieldClassName, "mt-2"].join(" ")} value={scaleName} onChange={(event) => onScaleChange(event.target.value)}>
                  {scaleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className={tileClassName}>
                <span className={tileLabelClassName}>Label Mode</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {displayModes.map((option) => (
                    <button key={option} className={optionButtonClassName(option === displayMode)} onClick={() => onDisplayModeChange(option)} type="button">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-[18px] border border-[#dfd2c7] bg-[#fffaf6] p-3 shadow-[0_4px_12px_rgba(91,56,36,0.05)]">
              <FretRangeSlider endFret={endFret} maxFret={maxFret} onEndFretChange={onEndFretChange} onStartFretChange={onStartFretChange} startFret={startFret} />
            </div>
          </div>

          <div className={cardClassName}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className={sectionTitleClassName}>Interval Selector</h3>
              <p className="m-0 text-[0.84rem] text-[#7c685a]">Toggle the degrees you want visible on the board.</p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
              {noteLabels.map((label, index) => {
                const checked = noteSelections[index];
                const disabled = index >= scaleLength;

                return (
                  <label key={label} className={degreeButtonClassName(checked, disabled)}>
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
        </div>

        <div className="grid gap-3">
          <div className={[cardClassName, "bg-[linear-gradient(180deg,rgba(255,248,240,0.95),rgba(240,228,216,0.95))]"].join(" ")}>
            <h3 className={sectionTitleClassName}>Instrument</h3>
            <div className="mt-3 grid gap-3">
              <div>
                <span className={tileLabelClassName}>Instrument</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {instrumentOptions.map((option) => (
                    <button key={option} className={optionButtonClassName(option === instrument)} onClick={() => onInstrumentChange(option)} type="button">
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={tileLabelClassName}>Tuning</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tuningOptions.map((option) => (
                    <button key={option} className={optionButtonClassName(option === tuningName)} onClick={() => onTuningChange(option)} type="button">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={[cardClassName, "bg-[linear-gradient(180deg,rgba(255,248,240,0.95),rgba(240,228,216,0.95))]"].join(" ")}>
            <h3 className={sectionTitleClassName}>Action</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button className={buttonClassName} onClick={onCopy} type="button">
                Copy Tab
              </button>
              <button className={primaryButtonClassName} onClick={onSave} type="button">
                Save Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
