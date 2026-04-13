import GraphicFretboard from "./GraphicFretboard";
import { DEFAULT_FRETBOARD_VISUAL_SETTINGS, withAlpha } from "../lib/fretboardVisualSettings";
import { getGraphicFretboardMetrics } from "./GraphicFretboard";

export default function OutputPanel({ isSmartphone = false, model, visualSettings = DEFAULT_FRETBOARD_VISUAL_SETTINGS }) {
  const metrics = getGraphicFretboardMetrics(model, visualSettings);
  const smartphoneAspectRatio = metrics ? `${metrics.svgWidth} / ${metrics.svgHeight}` : undefined;
  const frameClassName = isSmartphone ? "w-full" : "h-[clamp(300px,46vh,430px)]";
  const frameStyle = isSmartphone ? { aspectRatio: smartphoneAspectRatio } : undefined;

  return (
    // Outer panel padding around the fretboard display. Reduce these values to let the SVG sit closer to the dark rounded panel edge.
    <section
      className={[
        "w-[min(100%,1260px)] overflow-hidden",
        isSmartphone ? "rounded-[30px]" : "rounded-[38px]",
      ].join(" ")}
      style={{
        background: visualSettings.fretboardPanelColor,
        boxShadow: `0 26px 50px ${withAlpha(visualSettings.fretboardPanelColor, 0.16)}`,
        paddingLeft: `${visualSettings.panelPaddingX}px`,
        paddingRight: `${visualSettings.panelPaddingX}px`,
        paddingTop: `${visualSettings.panelPaddingTop}px`,
        paddingBottom: `${visualSettings.panelPaddingBottom}px`,
      }}
    >
      <div className={frameClassName} style={frameStyle}>
        <GraphicFretboard model={model} visualSettings={visualSettings} />
      </div>
    </section>
  );
}
