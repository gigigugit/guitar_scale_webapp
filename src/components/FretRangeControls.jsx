const fieldClassName = "h-11 w-full rounded-[12px] border border-border bg-white/90 px-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/60 focus:ring-4 focus:ring-accent/15";

export default function FretRangeControls({
  startFret,
  endFret,
  highString,
  lowString,
  maxFret,
  stringCount,
  onStartFretChange,
  onEndFretChange,
  onHighStringChange,
  onLowStringChange,
  onMaxFretChange,
}) {
  return (
    <div className="grid gap-3 rounded-[18px] border border-[rgba(103,66,43,0.12)] bg-panel-strong p-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm text-muted">
        <span>Start Fret</span>
        <input className={fieldClassName} max={maxFret} min={0} onChange={(event) => onStartFretChange(event.target.value)} type="number" value={startFret} />
      </label>

      <label className="grid gap-2 text-sm text-muted">
        <span>End Fret</span>
        <input className={fieldClassName} max={maxFret} min={0} onChange={(event) => onEndFretChange(event.target.value)} type="number" value={endFret} />
      </label>

      <label className="grid gap-2 text-sm text-muted">
        <span>High String</span>
        <input className={fieldClassName} max={stringCount} min={1} onChange={(event) => onHighStringChange(event.target.value)} type="number" value={highString} />
      </label>

      <label className="grid gap-2 text-sm text-muted">
        <span>Low String</span>
        <input className={fieldClassName} max={stringCount} min={1} onChange={(event) => onLowStringChange(event.target.value)} type="number" value={lowString} />
      </label>

      <label className="grid gap-2 text-sm text-muted sm:col-span-2">
        <span>Max Fret</span>
        <input className={fieldClassName} max={24} min={12} onChange={(event) => onMaxFretChange(event.target.value)} type="number" value={maxFret} />
      </label>
    </div>
  );
}
