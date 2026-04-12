import GraphicFretboard from "./GraphicFretboard";
import { DEFAULT_FRETBOARD_VISUAL_SETTINGS } from "../lib/fretboardVisualSettings";
import { getGraphicFretboardMetrics } from "./GraphicFretboard";

export default function OutputPanel({ isSmartphone = false, model, visualSettings = DEFAULT_FRETBOARD_VISUAL_SETTINGS }) {
  const metrics = getGraphicFretboardMetrics(model, visualSettings);
  const smartphoneAspectRatio = metrics ? `${metrics.svgWidth} / ${metrics.svgHeight}` : undefined;

  return (
    // Outer panel padding around the fretboard display. Reduce these values to let the SVG sit closer to the dark rounded panel edge.
    <section
      className={[
        "w-[min(100%,1260px)] overflow-hidden bg-[#5b3824] shadow-[0_26px_50px_rgba(91,56,36,0.16)]",
        isSmartphone ? "rounded-[30px]" : "rounded-[38px]",
      ].join(" ")}
      style={{
        paddingLeft: `${visualSettings.panelPaddingX}px`,
        paddingRight: `${visualSettings.panelPaddingX}px`,
        paddingTop: `${visualSettings.panelPaddingTop}px`,
        paddingBottom: `${visualSettings.panelPaddingBottom}px`,
      }}
    >
      <div className={isSmartphone ? "w-full" : "h-[clamp(300px,46vh,430px)]"} style={isSmartphone ? { aspectRatio: smartphoneAspectRatio } : undefined}>
        <GraphicFretboard model={model} visualSettings={visualSettings} />
      </div>
    </section>
  );
}
