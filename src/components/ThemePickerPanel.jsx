import { THEME_PRESET_IDS, THEME_PRESETS, getThemePresetOverrides } from "../lib/fretboardVisualSettings";

const shellStyle = {
  color: "var(--theme-app-text)",
  fontFamily: "var(--theme-ui-font)",
};

const cardStyle = {
  background: "var(--theme-surface-strong)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
};

const actionButtonStyle = {
  background: "var(--theme-surface)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-app-text)",
};

const primaryButtonStyle = {
  background: "var(--theme-accent)",
  borderColor: "var(--theme-accent-strong)",
  color: "var(--theme-accent-text)",
};

function ThemePreview({ preset }) {
  const overrides = getThemePresetOverrides(preset.id);

  return (
    <div
      className="relative overflow-hidden rounded-[20px] border p-3 shadow-[0_14px_28px_rgba(20,18,15,0.08)]"
      style={{
        background: `radial-gradient(circle at 22% 18%, ${overrides.appGlowColor}33 0%, transparent 42%), linear-gradient(180deg, ${overrides.appBackgroundAccentColor}, ${overrides.appBackgroundColor})`,
        borderColor: `${overrides.borderColor}`,
        color: overrides.appTextColor,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] opacity-70">{preset.vibe}</div>
          <div className="mt-1 text-[1rem] font-semibold leading-tight">{preset.label}</div>
        </div>
        <div className="flex gap-1.5">
          {[overrides.appBackgroundColor, overrides.surfaceColor, overrides.accentColor, overrides.noteFillColor].map((color) => (
            <span key={color} className="h-3.5 w-3.5 rounded-full border border-white/40 shadow-[0_1px_3px_rgba(0,0,0,0.12)]" style={{ background: color }} />
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border p-3" style={{ background: overrides.surfaceStrongColor, borderColor: overrides.borderColor }}>
        <div className="rounded-[16px] p-3 shadow-[0_10px_20px_rgba(0,0,0,0.12)]" style={{ background: overrides.fretboardPanelColor }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[0.74rem] font-semibold uppercase tracking-[0.16em]" style={{ color: overrides.stringLabelColor, fontFamily: overrides.fretboardFontFamily }}>E D G</div>
            <div className="rounded-full px-2.5 py-1 text-[0.74rem] font-semibold" style={{ background: overrides.accentColor, color: overrides.accentTextColor }}>
              I IV V
            </div>
          </div>
          <div className="relative h-16 rounded-[14px] border px-2" style={{ borderColor: `${overrides.stringLineColor}55` }}>
            {[18, 34, 50].map((top) => (
              <span key={top} className="absolute left-2 right-2 h-px" style={{ top: `${top}px`, background: overrides.stringLineColor }} />
            ))}
            {[26, 68, 108, 148, 188].map((left, index) => (
              <span key={left} className="absolute top-2 bottom-2 w-px" style={{ left: `${left}px`, background: index === 0 ? overrides.fretNumberColor : overrides.fretLineColor, opacity: index === 0 ? 1 : 0.92 }} />
            ))}
            <span className="absolute left-[72px] top-[11px] h-6 w-6 rounded-full" style={{ background: overrides.noteFillColor }} />
            <span className="absolute left-[152px] top-[37px] h-6 w-6 rounded-full" style={{ background: overrides.noteFillColor }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="m-0 text-[0.76rem] leading-5" style={{ color: overrides.mutedTextColor }}>{preset.description}</p>
          <div className="rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: overrides.borderColor, background: overrides.surfaceColor, color: overrides.accentColor }}>
            {preset.id === THEME_PRESET_IDS.NEON_FRET_LAB ? "High Contrast" : "Theme"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemePickerPanel({ activeThemeId, onApplyTheme, onReset, onSave }) {
  const isCustomTheme = activeThemeId === THEME_PRESET_IDS.CUSTOM;

  return (
    <section className="grid gap-3" style={shellStyle}>
      <section className="rounded-[22px] border p-4 shadow-[0_10px_28px_rgba(20,18,15,0.05)]" style={cardStyle}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[46rem]">
            <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>Theme Picker</p>
            <h3 className="mt-1 text-[1.1rem] font-semibold tracking-[-0.03em]">Choose the visual language for the whole app shell.</h3>
            <p className="mb-0 mt-1 text-[0.84rem] leading-6" style={{ color: "var(--theme-muted)" }}>
              Presets update the page background, drawer surfaces, typography, and fretboard palette together. Use the Visual Tweaks tab afterward if you want to fine-tune one of them.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button className="h-8 rounded-full border px-3 text-[0.76rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/10" onClick={onReset} style={actionButtonStyle} type="button">
              Reset
            </button>
            <button className="h-8 rounded-full border px-3 text-[0.76rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/15" onClick={onSave} style={primaryButtonStyle} type="button">
              Save Theme
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.76rem]">
          <span className="rounded-full border px-2.5 py-1 font-semibold uppercase tracking-[0.14em]" style={{ borderColor: "var(--theme-border)", background: "var(--theme-surface)", color: "var(--theme-muted)" }}>
            {isCustomTheme ? "Manual Mix" : "Preset Active"}
          </span>
          <span style={{ color: "var(--theme-muted)" }}>
            {isCustomTheme ? "You have manual overrides applied. Picking a preset will realign the full theme." : "Tap any card below to swap the app palette instantly."}
          </span>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const isActive = preset.id === activeThemeId;

          return (
            <button
              key={preset.id}
              className="grid gap-2 rounded-[24px] border p-2 text-left transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/12"
              onClick={() => onApplyTheme(preset.id)}
              style={{
                background: isActive ? "var(--theme-surface-strong)" : "var(--theme-surface)",
                borderColor: isActive ? "var(--theme-accent)" : "var(--theme-border)",
                boxShadow: isActive ? "0 18px 40px var(--theme-fretboard-shadow)" : "0 10px 22px rgba(20,18,15,0.04)",
              }}
              type="button"
            >
              <ThemePreview preset={preset} />

              <div className="flex items-center justify-between px-2 pb-1">
                <div>
                  <div className="text-[0.92rem] font-semibold">{preset.label}</div>
                  <div className="text-[0.75rem]" style={{ color: "var(--theme-muted)" }}>{preset.vibe}</div>
                </div>

                <span
                  className="rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em]"
                  style={isActive ? primaryButtonStyle : actionButtonStyle}
                >
                  {isActive ? "Current" : "Apply"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}