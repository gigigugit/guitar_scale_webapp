import { FRETBOARD_VISUAL_SETTING_FIELDS } from "../lib/fretboardVisualSettings";

const toggleClassName = "inline-flex rounded-full border border-[#d8cec4] bg-[#fbf8f4] p-0.5 shadow-[0_1px_4px_rgba(91,56,36,0.06)]";
const toggleOptionClassName = "min-w-9 rounded-full px-2 py-1 text-[0.68rem] font-semibold leading-none transition focus:outline-none";
const actionButtonClassName = "h-7 rounded-full border border-[#d8cec4] bg-[#fbf8f4] px-2.5 text-[0.72rem] font-semibold text-[#5b3824] transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10";
const primaryActionButtonClassName = "h-7 rounded-full border border-[#6a4531] bg-[#5b3824] px-2.5 text-[0.72rem] font-semibold text-[#f8dfc3] transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[#5b3824]/15";
const stepperButtonClassName = "inline-flex h-4.5 w-5 items-center justify-center rounded-[6px] border border-[#d8cec4] bg-[#fbf8f4] text-[0.68rem] font-semibold leading-none text-[#5b3824] shadow-[0_1px_2px_rgba(91,56,36,0.04)] transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10";
const valuePillClassName = "inline-flex min-w-10 items-center justify-center rounded-[8px] border border-[#ded2c7] bg-[#fffaf6] px-1.5 py-0.5 text-[0.68rem] font-semibold text-[#4d382c] shadow-[0_1px_2px_rgba(91,56,36,0.03)]";
const fieldCardClassName = "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5 rounded-[10px] border border-[#eadfd6] bg-[rgba(255,255,255,0.28)] px-2 py-1.5";

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
    <div className={fieldCardClassName}>
      <div className="min-w-0">
        <span className="block text-[0.76rem] font-semibold leading-tight text-[#4d382c]">{field.label}</span>
        <span className="mt-0.5 block text-[0.64rem] leading-snug text-[#7a6658]">{field.description}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={valuePillClassName}>{formatFieldValue(numericValue, field)}</span>
        <div className="grid gap-1">
          <button aria-label={`Increase ${field.label}`} className={stepperButtonClassName} onClick={() => nudge(1)} type="button">
            +
          </button>
          <button aria-label={`Decrease ${field.label}`} className={stepperButtonClassName} onClick={() => nudge(-1)} type="button">
            -
          </button>
        </div>
      </div>
    </div>
  );
}

function BooleanSettingControl({ field, onSettingChange, settings }) {
  const enabled = Boolean(settings[field.key]);

  return (
    <div className={fieldCardClassName}>
      <div className="min-w-0">
        <span className="block text-[0.76rem] font-semibold leading-tight text-[#4d382c]">{field.label}</span>
        <span className="mt-0.5 block text-[0.64rem] leading-snug text-[#7a6658]">{field.description}</span>
      </div>

      <div className={toggleClassName} role="group" aria-label={field.label}>
        <button
          aria-pressed={!enabled}
          className={`${toggleOptionClassName} ${!enabled ? "bg-[#5b3824] text-[#f8dfc3]" : "text-[#7a6658]"}`}
          onClick={() => onSettingChange(field.key, false)}
          type="button"
        >
          No
        </button>
        <button
          aria-pressed={enabled}
          className={`${toggleOptionClassName} ${enabled ? "bg-[#5b3824] text-[#f8dfc3]" : "text-[#7a6658]"}`}
          onClick={() => onSettingChange(field.key, true)}
          type="button"
        >
          Yes
        </button>
      </div>
    </div>
  );
}

export default function VisualTweaksPanel({ onReset, onSave, onSettingChange, settings }) {
  const fields = FRETBOARD_VISUAL_SETTING_FIELDS.flatMap((section) => section.fields.map((field) => ({ ...field, section: section.section })));

  return (
    <section className="grid gap-1.5">
      <div className="flex flex-wrap justify-end gap-1.5">
        <button className={actionButtonClassName} onClick={onReset} type="button">
          Reset
        </button>
        <button className={primaryActionButtonClassName} onClick={onSave} type="button">
          Save
        </button>
      </div>

      <div className="grid gap-1.5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {fields.map((field) => {
          if (field.type === "boolean") {
            return <BooleanSettingControl key={field.key} field={field} onSettingChange={onSettingChange} settings={settings} />;
          }

          return <NumericSettingControl key={field.key} field={field} onSettingChange={onSettingChange} value={settings[field.key]} />;
        })}
      </div>
    </section>
  );
}