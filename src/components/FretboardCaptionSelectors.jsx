import {
  captionClassName,
  captionStyle,
  fretLabelStyle,
  selectClassName,
  selectStyle,
  separatorClassName,
  separatorStyle,
} from "./captionSelectorStyles";

export default function FretboardCaptionSelectors({
  displayMode,
  displayModes,
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
  onDisplayModeChange,
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

        <select className={selectClassName} onChange={(event) => onDisplayModeChange(event.target.value)} style={selectStyle} value={displayMode}>
          {displayModes.map((option) => (
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
