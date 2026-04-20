import {
  captionClassName,
  captionStyle,
  selectClassName,
  selectStyle,
  separatorClassName,
  separatorStyle,
} from "./captionSelectorStyles";

const sectionStyle = { fontFamily: "var(--theme-ui-font)" };
const noticeStyle = { color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };

export default function ChordTitleControls({
  chordId,
  chordOptions = [],
  chordStructureId,
  chordStructureOptions = [],
  displayTarget,
  displayTargets = [],
  notice = null,
  onChordChange,
  onChordStructureChange,
  onDisplayTargetChange,
  onVariantChange,
  selectedVariantId,
  variantOptions = [],
}) {
  const showChordRows = displayTarget === "Chord";
  const selectedChordValue = chordId ?? chordOptions[0]?.id ?? "";
  const selectedChordStructureValue = chordStructureId ?? chordStructureOptions[0]?.id ?? "";
  const selectedVariantValue = selectedVariantId ?? variantOptions[0]?.id ?? "";
  const showNotice = showChordRows && Boolean(notice);
  const inactiveChordClassName = showChordRows ? "" : "cursor-not-allowed border-[#e5ddd6] bg-[#f3ece7] text-[#aa998e] shadow-none";
  const inactiveChordStyle = showChordRows
    ? selectStyle
    : {
        ...selectStyle,
        background: "color-mix(in srgb, var(--theme-surface) 88%, var(--theme-app-bg) 12%)",
        borderColor: "color-mix(in srgb, var(--theme-border) 80%, white 20%)",
        color: "var(--theme-muted)",
      };
  const inactiveStructureClassName = showChordRows ? "" : "cursor-not-allowed border-[#e5ddd6] bg-[#f3ece7] text-[#aa998e] shadow-none";
  const inactiveStructureStyle = showChordRows
    ? selectStyle
    : {
        ...selectStyle,
        background: "color-mix(in srgb, var(--theme-surface) 88%, var(--theme-app-bg) 12%)",
        borderColor: "color-mix(in srgb, var(--theme-border) 80%, white 20%)",
        color: "var(--theme-muted)",
      };
  const inactiveVariantClassName = showChordRows ? "" : "cursor-not-allowed border-[#e5ddd6] bg-[#f3ece7] text-[#aa998e] shadow-none";
  const inactiveVariantStyle = showChordRows
    ? selectStyle
    : {
        ...selectStyle,
        background: "color-mix(in srgb, var(--theme-surface) 88%, var(--theme-app-bg) 12%)",
        borderColor: "color-mix(in srgb, var(--theme-border) 80%, white 20%)",
        color: "var(--theme-muted)",
      };

  return (
    <div className="grid justify-items-center gap-1 max-[height:430px]:gap-0.5" style={sectionStyle}>
      <div className={[captionClassName, "w-full overflow-x-auto overscroll-x-contain text-center transition-opacity duration-150 opacity-100"].join(" ")} style={captionStyle}>
        <div className="compact-height-caption-row mx-auto flex min-w-max items-center justify-center gap-x-1.5 gap-y-1 px-1">
          <select className={selectClassName} onChange={(event) => onDisplayTargetChange(event.target.value)} style={selectStyle} value={displayTarget}>
            {displayTargets.map((target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>

          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Chord</span>
          <select className={[selectClassName, inactiveChordClassName].join(" ").trim()} disabled={!showChordRows} onChange={(event) => onChordChange(event.target.value)} style={inactiveChordStyle} tabIndex={showChordRows ? 0 : -1} value={selectedChordValue}>
            {chordOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>
          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Structure</span>
          <select className={[selectClassName, inactiveStructureClassName].join(" ").trim()} disabled={!showChordRows} onChange={(event) => onChordStructureChange(event.target.value)} style={inactiveStructureStyle} tabIndex={showChordRows ? 0 : -1} value={selectedChordStructureValue}>
            {chordStructureOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <span className={separatorClassName} style={separatorStyle}>|</span>
          <span className="compact-height-fret-label text-[0.82rem] font-semibold" style={separatorStyle}>Position</span>
          <select className={[selectClassName, inactiveVariantClassName].join(" ").trim()} disabled={!showChordRows} onChange={(event) => onVariantChange(event.target.value)} style={inactiveVariantStyle} tabIndex={showChordRows ? 0 : -1} value={selectedVariantValue}>
            {variantOptions.map((option) => (
              <option disabled={option.disabled} key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showNotice ? (
        <p className="m-0 max-w-[34rem] text-center text-[0.76rem] leading-5" style={noticeStyle}>
          {notice}
        </p>
      ) : null}
    </div>
  );
}
