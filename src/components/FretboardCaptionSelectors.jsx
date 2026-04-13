const captionClassName = "compact-height-caption text-[0.9rem] text-[#6d5a4e]";
const selectClassName =
  "compact-height-select min-h-8 rounded-full border border-[#dbcabf] bg-[#fffaf6] px-3 py-1 text-[0.82rem] font-semibold text-[#5b3824] shadow-[0_1px_4px_rgba(91,56,36,0.06)] outline-none transition focus:border-[#8a6a55] focus:ring-4 focus:ring-[#5b3824]/10";
const separatorClassName = "compact-height-separator text-[#8d7666]";

const captionStyle = { color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };
const selectStyle = { background: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-app-text)", fontFamily: "var(--theme-ui-font)" };
const separatorStyle = { color: "var(--theme-muted)" };
const fretLabelStyle = { color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };

export default function FretboardCaptionSelectors({
  selectedKey,
  scaleName,
  keyOptions,
  scaleOptions,
  instrument,
  instrumentOptions,
  tuningName,
  tuningOptions,
  startFret,
  endFret,
  maxFret,
  onKeyChange,
  onScaleChange,
  onInstrumentChange,
  onTuningChange,
  onStartFretChange,
  onEndFretChange,
}) {
  const lowFretOptions = Array.from({ length: maxFret }, (_, index) => index);
  const highFretOptions = Array.from({ length: maxFret }, (_, index) => index + 1);

  return (
    <div className={[captionClassName, "w-full overflow-x-auto overscroll-x-contain text-center"].join(" ")} style={captionStyle}>
      <div className="compact-height-caption-row mx-auto flex min-w-max items-center justify-center gap-x-1.5 gap-y-1 px-1">
        <select className={selectClassName} onChange={(event) => onKeyChange(event.target.value)} style={selectStyle} value={selectedKey}>
          {keyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select className={selectClassName} onChange={(event) => onScaleChange(event.target.value)} style={selectStyle} value={scaleName}>
          {scaleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className={separatorClassName} style={separatorStyle}>|</span>

        <select className={selectClassName} onChange={(event) => onInstrumentChange(event.target.value)} style={selectStyle} value={instrument}>
          {instrumentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className={separatorClassName} style={separatorStyle}>|</span>

        <select className={selectClassName} onChange={(event) => onTuningChange(event.target.value)} style={selectStyle} value={tuningName}>
          {tuningOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className={separatorClassName} style={separatorStyle}>|</span>

        <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={fretLabelStyle}>Frets</span>
        <select className={selectClassName} onChange={(event) => onStartFretChange(event.target.value)} style={selectStyle} value={startFret}>
          {lowFretOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className={separatorClassName} style={separatorStyle}>-</span>
        <select className={selectClassName} onChange={(event) => onEndFretChange(event.target.value)} style={selectStyle} value={endFret}>
          {highFretOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
