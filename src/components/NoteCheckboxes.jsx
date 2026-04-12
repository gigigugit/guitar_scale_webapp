export default function NoteCheckboxes({ labels, selections, scaleLength, onToggle }) {
  return (
    <div className="rounded-[18px] border border-[rgba(103,66,43,0.12)] bg-panel-strong p-4">
      <p className="m-0 text-[0.75rem] uppercase tracking-[0.18em] text-muted">Scale Degrees</p>
      <h2 className="font-serif text-2xl text-ink">Notes Displayed</h2>
      <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(88px,1fr))] gap-2.5">
        {labels.map((label, index) => {
          const checked = selections[index];
          const disabled = index >= scaleLength;
          return (
            <label
              key={label}
              className={[
                "relative flex min-h-12 items-center justify-center rounded-full border px-3 py-2 text-sm font-bold transition",
                checked && !disabled
                  ? "border-accent/45 bg-[linear-gradient(180deg,rgba(166,80,31,0.14),rgba(166,80,31,0.22))] text-accent-deep"
                  : "border-[rgba(103,66,43,0.16)] bg-[rgba(255,251,246,0.96)] text-ink",
                disabled ? "opacity-45" : "cursor-pointer hover:-translate-y-px",
              ].join(" ")}
            >
              <input
                checked={checked}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={disabled}
                onChange={() => onToggle(index)}
                type="checkbox"
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
