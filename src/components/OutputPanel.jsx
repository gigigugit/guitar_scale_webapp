import GraphicFretboard from "./GraphicFretboard";
import { DEFAULT_FRETBOARD_VISUAL_SETTINGS } from "../lib/fretboardVisualSettings";

export default function OutputPanel({ model, visualSettings = DEFAULT_FRETBOARD_VISUAL_SETTINGS }) {
  return (
    // Outer panel padding around the fretboard display. Reduce these values to let the SVG sit closer to the dark rounded panel edge.
    <section
      className="w-[min(100%,1260px)] overflow-hidden rounded-[38px] bg-[#5b3824] shadow-[0_26px_50px_rgba(91,56,36,0.16)]"
      style={{
        paddingLeft: `${visualSettings.panelPaddingX}px`,
        paddingRight: `${visualSettings.panelPaddingX}px`,
        paddingTop: `${visualSettings.panelPaddingTop}px`,
        paddingBottom: `${visualSettings.panelPaddingBottom}px`,
      }}
    >
      <div className="h-[clamp(300px,46vh,430px)]">
        <GraphicFretboard model={model} visualSettings={visualSettings} />
      </div>
    </section>
  );
}
