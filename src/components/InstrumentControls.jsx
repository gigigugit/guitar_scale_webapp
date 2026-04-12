const fieldClassName = "h-11 w-full rounded-[12px] border border-border bg-white/90 px-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/60 focus:ring-4 focus:ring-accent/15";

export default function InstrumentControls({
  displayMode,
  displayModes,
  instrument,
  instrumentOptions,
  tuningName,
  tuningOptions,
  onDisplayModeChange,
  onInstrumentChange,
  onTuningChange,
}) {
  return (
    <div className="grid gap-3 rounded-[18px] border border-[rgba(103,66,43,0.12)] bg-panel-strong p-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm text-muted">
        <span>Display</span>
        <select className={fieldClassName} value={displayMode} onChange={(event) => onDisplayModeChange(event.target.value)}>
          {displayModes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm text-muted">
        <span>Instrument</span>
        <select className={fieldClassName} value={instrument} onChange={(event) => onInstrumentChange(event.target.value)}>
          {instrumentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm text-muted sm:col-span-2">
        <span>Select Tuning</span>
        <select className={fieldClassName} value={tuningName} onChange={(event) => onTuningChange(event.target.value)}>
          {tuningOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
