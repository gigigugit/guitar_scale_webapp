import { FRETBOARD_VISUAL_SETTING_FIELDS } from "../lib/fretboardVisualSettings";

const sectionCardClassName = "rounded-[18px] border p-3.5 shadow-[0_8px_18px_rgba(91,56,36,0.05)]";
const toggleClassName = "inline-flex rounded-full border p-0.5 shadow-[0_1px_4px_rgba(91,56,36,0.06)]";
const toggleOptionClassName = "min-w-9 rounded-full px-2 py-1 text-[0.68rem] font-semibold leading-none transition focus:outline-none";
const actionButtonClassName = "h-7 rounded-full border px-2.5 text-[0.72rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/10";
const primaryActionButtonClassName = "h-7 rounded-full border px-2.5 text-[0.72rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/15";
const stepperButtonClassName = "inline-flex h-4.5 w-5 items-center justify-center rounded-[6px] border text-[0.68rem] font-semibold leading-none shadow-[0_1px_2px_rgba(91,56,36,0.04)] transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/10";
const valuePillClassName = "inline-flex min-w-10 items-center justify-center rounded-[8px] border px-1.5 py-0.5 text-[0.68rem] font-semibold shadow-[0_1px_2px_rgba(91,56,36,0.03)]";
const fieldCardClassName = "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5 rounded-[10px] border px-2 py-1.5";

const surfaceStyle = {
  background: "var(--theme-surface)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
};

const strongSurfaceStyle = {
  background: "var(--theme-surface-strong)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
};

const mutedTextStyle = { color: "var(--theme-muted)" };
const accentButtonStyle = {
  background: "var(--theme-accent)",
  borderColor: "var(--theme-accent)",
  color: "var(--theme-accent-text)",
};

function clampToField(value, field) {
  const next = Math.min(Math.max(value, field.min), field.max);

  if (!field.step || Number.isInteger(field.step)) {
    return Math.round(next);
  }

  const precision = String(field.step).includes(".") ? String(field.step).split(".")[1].length : 0;
  return Number(next.toFixed(precision));
}

function formatFieldValue(value, field) {
  if (!field.step || Number.isInteger(field.step)) {
    return String(Math.round(value));
  }

  const precision = String(field.step).includes(".") ? String(field.step).split(".")[1].length : 0;
  return Number(value).toFixed(precision);
}

function NumericSettingControl({ field, onSettingChange, value }) {
  const numericValue = Number(value);

  function nudge(direction) {
    onSettingChange(field.key, clampToField(numericValue + field.step * direction, field));
  }

  return (
    <div className={fieldCardClassName} style={{ ...surfaceStyle, background: "rgba(255,255,255,0.18)" }}>
      <div className="min-w-0">
        <span className="block text-[0.76rem] font-semibold leading-tight">{field.label}</span>
        <span className="mt-0.5 block text-[0.64rem] leading-snug" style={mutedTextStyle}>{field.description}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={valuePillClassName} style={strongSurfaceStyle}>{formatFieldValue(numericValue, field)}</span>
        <div className="grid gap-1">
          <button aria-label={`Increase ${field.label}`} className={stepperButtonClassName} onClick={() => nudge(1)} style={surfaceStyle} type="button">
            +
          </button>
          <button aria-label={`Decrease ${field.label}`} className={stepperButtonClassName} onClick={() => nudge(-1)} style={surfaceStyle} type="button">
            -
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorSettingControl({ field, onSettingChange, value }) {
  return (
    <div className={fieldCardClassName} style={{ ...surfaceStyle, background: "rgba(255,255,255,0.18)" }}>
      <div className="min-w-0">
        <span className="block text-[0.76rem] font-semibold leading-tight">{field.label}</span>
        <span className="mt-0.5 block text-[0.64rem] leading-snug" style={mutedTextStyle}>{field.description}</span>
      </div>

      <label className="flex items-center gap-1.5">
        <span className={valuePillClassName} style={strongSurfaceStyle}>{value.toUpperCase()}</span>
        <input
          aria-label={field.label}
          className="h-8 w-10 cursor-pointer rounded-[10px] border p-0"
          onChange={(event) => onSettingChange(field.key, event.target.value)}
          style={{ ...surfaceStyle, background: "transparent" }}
          type="color"
          value={value}
        />
      </label>
    </div>
  );
}

function SelectSettingControl({ field, onSettingChange, value }) {
  return (
    <div className={fieldCardClassName} style={{ ...surfaceStyle, background: "rgba(255,255,255,0.18)" }}>
      <div className="min-w-0">
        <span className="block text-[0.76rem] font-semibold leading-tight">{field.label}</span>
        <span className="mt-0.5 block text-[0.64rem] leading-snug" style={mutedTextStyle}>{field.description}</span>
      </div>

      <select className="min-w-[8.5rem] rounded-[10px] border px-2 py-1 text-[0.72rem] font-semibold" onChange={(event) => onSettingChange(field.key, event.target.value)} style={strongSurfaceStyle} value={value}>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function BooleanSettingControl({ field, onSettingChange, settings }) {
  const enabled = Boolean(settings[field.key]);

  return (
    <div className={fieldCardClassName} style={{ ...surfaceStyle, background: "rgba(255,255,255,0.18)" }}>
      <div className="min-w-0">
        <span className="block text-[0.76rem] font-semibold leading-tight">{field.label}</span>
        <span className="mt-0.5 block text-[0.64rem] leading-snug" style={mutedTextStyle}>{field.description}</span>
      </div>

      <div className={toggleClassName} role="group" aria-label={field.label} style={surfaceStyle}>
        <button
          aria-pressed={!enabled}
          className={toggleOptionClassName}
          onClick={() => onSettingChange(field.key, false)}
          style={!enabled ? accentButtonStyle : mutedTextStyle}
          type="button"
        >
          No
        </button>
        <button
          aria-pressed={enabled}
          className={toggleOptionClassName}
          onClick={() => onSettingChange(field.key, true)}
          style={enabled ? accentButtonStyle : mutedTextStyle}
          type="button"
        >
          Yes
        </button>
      </div>
    </div>
  );
}

function InstrumentStringSpacingControl({ instrument, max, min, onChange, value }) {
  const percentValue = Math.round(Number(value) * 100);

  return (
    <section className={sectionCardClassName} style={strongSurfaceStyle}>
      <div className="mb-2.5">
        <h3 className="m-0 text-[0.84rem] font-semibold uppercase tracking-[0.16em]">String Spacing</h3>
      </div>

      <div className={fieldCardClassName} style={{ ...surfaceStyle, background: "rgba(255,255,255,0.18)" }}>
        <div className="min-w-0">
          <span className="block text-[0.76rem] font-semibold leading-tight">{instrument} string distance</span>
          <span className="mt-0.5 block text-[0.64rem] leading-snug" style={mutedTextStyle}>
            Fine-tunes the vertical gap between strings for the current instrument without shifting the fretboard panel off position.
          </span>
        </div>

        <div className="grid min-w-[10rem] gap-1.5">
          <div className="flex items-center justify-between gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.14em]" style={mutedTextStyle}>
            <span>Tight</span>
            <span className={valuePillClassName} style={strongSurfaceStyle}>{percentValue}%</span>
            <span>Wide</span>
          </div>
          <input
            aria-label={`${instrument} string spacing`}
            className="w-full cursor-pointer accent-[var(--theme-accent)]"
            max={max}
            min={min}
            onChange={(event) => onChange(event.target.value)}
            step={0.01}
            type="range"
            value={value}
          />
        </div>
      </div>
    </section>
  );
}

export default function VisualTweaksPanel({ instrument, instrumentStringSpacing, onInstrumentStringSpacingChange, onReset, onSave, onSettingChange, settings, stringSpacingMax, stringSpacingMin }) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap justify-end gap-1.5">
        <button className={actionButtonClassName} onClick={onReset} style={surfaceStyle} type="button">
          Reset
        </button>
        <button className={primaryActionButtonClassName} onClick={onSave} style={accentButtonStyle} type="button">
          Save
        </button>
      </div>

      {settings.draggableUiMode ? (
        <div className={sectionCardClassName} style={{ ...strongSurfaceStyle, display: "grid", gap: "0.35rem" }}>
          <span className="text-[0.76rem] font-semibold uppercase tracking-[0.14em]">Draggable UI Active</span>
          <span className="text-[0.7rem] leading-snug" style={mutedTextStyle}>
            Drag the highlighted edges on the fretboard panel to tune panel padding, board bounds, and the open-string lane without leaving the viewer.
          </span>
        </div>
      ) : null}

      {typeof onInstrumentStringSpacingChange === "function" ? (
        <InstrumentStringSpacingControl
          instrument={instrument}
          max={stringSpacingMax}
          min={stringSpacingMin}
          onChange={onInstrumentStringSpacingChange}
          value={instrumentStringSpacing}
        />
      ) : null}

      <div className="grid gap-3">
        {FRETBOARD_VISUAL_SETTING_FIELDS.map((section) => (
          <section key={section.section} className={sectionCardClassName} style={strongSurfaceStyle}>
            <div className="mb-2.5">
              <h3 className="m-0 text-[0.84rem] font-semibold uppercase tracking-[0.16em]">{section.section}</h3>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {section.fields.map((field) => {
                if (field.type === "boolean") {
                  return <BooleanSettingControl key={field.key} field={field} onSettingChange={onSettingChange} settings={settings} />;
                }

                if (field.type === "color") {
                  return <ColorSettingControl key={field.key} field={field} onSettingChange={onSettingChange} value={settings[field.key]} />;
                }

                if (field.type === "select") {
                  return <SelectSettingControl key={field.key} field={field} onSettingChange={onSettingChange} value={settings[field.key]} />;
                }

                return <NumericSettingControl key={field.key} field={field} onSettingChange={onSettingChange} value={settings[field.key]} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}