import { useEffect, useMemo, useRef, useState } from "react";
import GraphicFretboard from "./GraphicFretboard";
import { DEFAULT_FRETBOARD_VISUAL_SETTINGS, FRETBOARD_VISUAL_SETTING_FIELDS, withAlpha } from "../lib/fretboardVisualSettings";
import { getGraphicFretboardMetrics } from "./GraphicFretboard";

const DRAGGABLE_SETTING_FIELD_MAP = new Map(
  FRETBOARD_VISUAL_SETTING_FIELDS.flatMap((section) => section.fields)
    .filter((field) => typeof field.min === "number" && typeof field.max === "number")
    .map((field) => [field.key, field]),
);

const HANDLE_INACTIVE_COLOR = "#ff38c7";
const HANDLE_ACTIVE_COLOR = "#ffe357";
const HANDLE_INACTIVE_GLOW = "rgba(255, 56, 199, 0.28)";
const HANDLE_ACTIVE_GLOW = "rgba(255, 227, 87, 0.28)";

function clampDraggedSettingValue(key, value) {
  const field = DRAGGABLE_SETTING_FIELD_MAP.get(key);

  if (!field) {
    return value;
  }

  const next = Math.min(Math.max(value, field.min), field.max);
  if (!field.step || Number.isInteger(field.step)) {
    return Math.round(next);
  }

  const precision = String(field.step).includes(".") ? String(field.step).split(".")[1].length : 0;
  return Number(next.toFixed(precision));
}

function DragHandle({ active = false, axis, calloutLabel, label, onPointerDown, style }) {
  const isHorizontal = axis === "y";
  const accentColor = active ? HANDLE_ACTIVE_COLOR : HANDLE_INACTIVE_COLOR;
  const glowColor = active ? HANDLE_ACTIVE_GLOW : HANDLE_INACTIVE_GLOW;
  const buttonStyle = {
    ...style,
    cursor: isHorizontal ? "ns-resize" : "ew-resize",
    height: isHorizontal ? "40px" : style.height,
    touchAction: "none",
    width: isHorizontal ? style.width : "76px",
  };
  const labelStyle = isHorizontal
    ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
    : { left: "50%", top: "50%", transform: "translate(-4%, -50%)" };

  return (
    <button
      aria-label={label}
      className="absolute z-20 rounded-full bg-transparent"
      onPointerDown={onPointerDown}
      style={buttonStyle}
      title={label}
      type="button"
    >
      <span
        aria-hidden="true"
        className="absolute block rounded-full"
        style={{
          background: accentColor,
          boxShadow: `0 0 0 3px ${glowColor}`,
          height: isHorizontal ? "3px" : "100%",
          left: isHorizontal ? 0 : "50%",
          top: isHorizontal ? "50%" : 0,
          transform: isHorizontal ? "translateY(-50%)" : "translateX(-50%)",
          width: isHorizontal ? "100%" : "3px",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute rounded-full border px-2 py-1 text-[0.54rem] font-black uppercase tracking-[0.18em]"
        style={{
          ...labelStyle,
          background: active ? "rgba(44, 34, 6, 0.94)" : "rgba(67, 12, 51, 0.92)",
          borderColor: accentColor,
          boxShadow: `0 0 0 2px ${glowColor}`,
          color: accentColor,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {calloutLabel}
      </span>
    </button>
  );
}

function DragSchematic({ activePart, showOpenLane }) {
  const panelColor = activePart === "panel" ? HANDLE_ACTIVE_COLOR : HANDLE_INACTIVE_COLOR;
  const boardColor = activePart === "board" ? HANDLE_ACTIVE_COLOR : HANDLE_INACTIVE_COLOR;
  const laneColor = activePart === "lane" ? HANDLE_ACTIVE_COLOR : HANDLE_INACTIVE_COLOR;

  return (
    <div
      className="pointer-events-none absolute right-3 top-3 z-10 w-[10.5rem] rounded-[16px] border px-3 py-2"
      style={{
        background: "rgba(22, 12, 18, 0.86)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.22)",
      }}
    >
      <div className="mb-1.5 text-[0.56rem] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255, 244, 224, 0.86)" }}>
        Layout Schematic
      </div>
      <svg aria-hidden="true" className="block h-[5.4rem] w-full" viewBox="0 0 156 94">
        <rect fill="rgba(255,255,255,0.02)" height="66" rx="16" stroke={panelColor} strokeWidth="2.4" width="124" x="16" y="16" />
        <rect fill="none" height="40" rx="10" stroke={boardColor} strokeDasharray="5 4" strokeWidth="2" width="88" x="40" y="29" />
        {showOpenLane ? <line stroke={laneColor} strokeWidth="2.4" x1="54" x2="54" y1="29" y2="69" /> : null}
        <text fill={panelColor} fontFamily="inherit" fontSize="9" fontWeight="800" x="16" y="11">PANEL</text>
        <text fill={boardColor} fontFamily="inherit" fontSize="9" fontWeight="800" x="91" y="26">BOARD</text>
        {showOpenLane ? <text fill={laneColor} fontFamily="inherit" fontSize="8.5" fontWeight="800" x="58" y="78">LANE</text> : null}
      </svg>
      <div className="grid gap-1 text-[0.54rem] font-bold uppercase tracking-[0.14em]">
        <span style={{ color: panelColor }}>Panel handles</span>
        <span style={{ color: boardColor }}>Board handles</span>
        {showOpenLane ? <span style={{ color: laneColor }}>Nut lane handle</span> : null}
      </div>
    </div>
  );
}

export default function OutputPanel({
  isSmartphone = false,
  isEditFocusMode = false,
  model,
  visualSettings = DEFAULT_FRETBOARD_VISUAL_SETTINGS,
  baseVisualSettings = visualSettings,
  onVisualSettingChange,
  showLayoutOverlay = false,
  svgRef,
}) {
  const metrics = getGraphicFretboardMetrics(model, visualSettings);
  const smartphoneAspectRatio = metrics ? `${metrics.svgWidth} / ${metrics.svgHeight}` : undefined;
  const shouldUseSimplifiedEditorView = !isSmartphone;
  const frameClassName = isSmartphone || shouldUseSimplifiedEditorView ? "w-full" : "h-[clamp(300px,46vh,430px)]";
  const frameStyle = isSmartphone || shouldUseSimplifiedEditorView ? { aspectRatio: smartphoneAspectRatio } : undefined;
  const frameRef = useRef(null);
  const [frameSize, setFrameSize] = useState({ height: 0, width: 0 });
  const [activeDrag, setActiveDrag] = useState(null);
  const draggableUiMode = baseVisualSettings.draggableUiMode === true;

  useEffect(() => {
    if (!frameRef.current) {
      return undefined;
    }

    const target = frameRef.current;
    const updateSize = () => {
      setFrameSize({
        height: target.clientHeight,
        width: target.clientWidth,
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activeDrag || typeof onVisualSettingChange !== "function") {
      return undefined;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = activeDrag.axis === "x" ? "ew-resize" : "ns-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (event) => {
      const pointer = activeDrag.axis === "x" ? event.clientX : event.clientY;
      const delta = pointer - activeDrag.startPointer;
      const displayValue = Number(visualSettings[activeDrag.key]);
      const baseValue = Number(baseVisualSettings[activeDrag.key]);
      const displayScale = baseValue > 0 && Number.isFinite(displayValue / baseValue) ? displayValue / baseValue : 1;
      const nextValue = clampDraggedSettingValue(activeDrag.key, activeDrag.startValue + (delta * activeDrag.multiplier) / displayScale);

      onVisualSettingChange(activeDrag.key, nextValue);
    };

    const stopDragging = () => {
      setActiveDrag(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [activeDrag, baseVisualSettings, onVisualSettingChange, visualSettings]);

  const renderedGraphic = useMemo(() => {
    if (!metrics) {
      return null;
    }

    const safeWidth = frameSize.width > 0 ? frameSize.width : metrics.svgWidth;
    const safeHeight = frameSize.height > 0 ? frameSize.height : metrics.svgHeight;
    const scale = Math.min(safeWidth / metrics.svgWidth, safeHeight / metrics.svgHeight);
    const renderedWidth = metrics.svgWidth * scale;
    const renderedHeight = metrics.svgHeight * scale;

    return {
      height: renderedHeight,
      offsetX: (safeWidth - renderedWidth) / 2,
      offsetY: (safeHeight - renderedHeight) / 2,
      scale,
      width: renderedWidth,
    };
  }, [frameSize.height, frameSize.width, metrics]);

  const dragHandles = useMemo(() => {
    if (!metrics || !renderedGraphic || !draggableUiMode || typeof onVisualSettingChange !== "function") {
      return [];
    }

    const contentLeft = visualSettings.panelPaddingX + renderedGraphic.offsetX;
    const contentTop = visualSettings.panelPaddingTop + renderedGraphic.offsetY;
    const contentRight = contentLeft + renderedGraphic.width;
    const contentBottom = contentTop + renderedGraphic.height;
    const handleThickness = 18;
    const boardStartX = contentLeft + metrics.boardStartX * renderedGraphic.scale;

    return [
      {
        axis: "x",
        calloutLabel: "Panel handle",
        id: "panel-left",
        key: "panelPaddingX",
        label: "Drag panel left edge",
        multiplier: 1,
        part: "panel",
        style: { bottom: 0, left: `${visualSettings.panelPaddingX}px`, top: 0, transform: "translateX(-50%)", width: `${handleThickness}px` },
      },
      {
        axis: "x",
        calloutLabel: "Panel handle",
        id: "panel-right",
        key: "panelPaddingX",
        label: "Drag panel right edge",
        multiplier: -1,
        part: "panel",
        style: { bottom: 0, right: `${visualSettings.panelPaddingX}px`, top: 0, transform: "translateX(50%)", width: `${handleThickness}px` },
      },
      {
        axis: "y",
        calloutLabel: "Panel handle",
        id: "panel-top",
        key: "panelPaddingTop",
        label: "Drag panel top edge",
        multiplier: 1,
        part: "panel",
        style: { height: `${handleThickness}px`, left: 0, right: 0, top: `${visualSettings.panelPaddingTop}px`, transform: "translateY(-50%)" },
      },
      {
        axis: "y",
        calloutLabel: "Panel handle",
        id: "panel-bottom",
        key: "panelPaddingBottom",
        label: "Drag panel bottom edge",
        multiplier: -1,
        part: "panel",
        style: { bottom: `${visualSettings.panelPaddingBottom}px`, height: `${handleThickness}px`, left: 0, right: 0, transform: "translateY(50%)" },
      },
      {
        axis: "x",
        calloutLabel: "Board handle",
        id: "board-left",
        key: "leftPad",
        label: "Drag board left edge",
        multiplier: 1,
        part: "board",
        style: { bottom: `${visualSettings.panelPaddingBottom}px`, left: `${contentLeft}px`, top: `${visualSettings.panelPaddingTop}px`, transform: "translateX(-50%)", width: `${handleThickness}px` },
      },
      {
        axis: "x",
        calloutLabel: "Board handle",
        id: "board-right",
        key: "rightPad",
        label: "Drag board right edge",
        multiplier: -1,
        part: "board",
        style: { bottom: `${visualSettings.panelPaddingBottom}px`, left: `${contentRight}px`, top: `${visualSettings.panelPaddingTop}px`, transform: "translateX(50%)", width: `${handleThickness}px` },
      },
      {
        axis: "y",
        calloutLabel: "Board handle",
        id: "board-top",
        key: "topPad",
        label: "Drag board top edge",
        multiplier: 1,
        part: "board",
        style: { height: `${handleThickness}px`, left: `${visualSettings.panelPaddingX}px`, right: `${visualSettings.panelPaddingX}px`, top: `${contentTop}px`, transform: "translateY(-50%)" },
      },
      {
        axis: "y",
        calloutLabel: "Board handle",
        id: "board-bottom",
        key: "bottomPad",
        label: "Drag board bottom edge",
        multiplier: -1,
        part: "board",
        style: { height: `${handleThickness}px`, left: `${visualSettings.panelPaddingX}px`, right: `${visualSettings.panelPaddingX}px`, top: `${contentBottom}px`, transform: "translateY(50%)" },
      },
      ...(model.showOpenStrings
        ? [
            {
              axis: "x",
              calloutLabel: "Lane handle",
              id: "open-lane",
              key: "openLaneWidth",
              label: "Drag open string lane",
              multiplier: 1,
              part: "lane",
              style: { bottom: `${visualSettings.panelPaddingBottom}px`, left: `${boardStartX}px`, top: `${visualSettings.panelPaddingTop}px`, transform: "translateX(-50%)", width: `${handleThickness}px` },
            },
          ]
        : []),
    ];
  }, [draggableUiMode, metrics, model.showOpenStrings, onVisualSettingChange, renderedGraphic, visualSettings]);

  const overlayGuides = useMemo(() => {
    if (!metrics || !renderedGraphic || !draggableUiMode) {
      return null;
    }

    const contentLeft = visualSettings.panelPaddingX + renderedGraphic.offsetX;
    const contentTop = visualSettings.panelPaddingTop + renderedGraphic.offsetY;

    return {
      contentBottom: contentTop + renderedGraphic.height,
      contentLeft,
      contentRight: contentLeft + renderedGraphic.width,
      contentTop,
      panelBottom: visualSettings.panelPaddingBottom,
    };
  }, [draggableUiMode, metrics, renderedGraphic, visualSettings]);

  const geometryOverlay = useMemo(() => {
    if (!metrics || !renderedGraphic || !showLayoutOverlay) {
      return null;
    }

    const contentLeft = visualSettings.panelPaddingX + renderedGraphic.offsetX;
    const contentTop = visualSettings.panelPaddingTop + renderedGraphic.offsetY;
    const scale = renderedGraphic.scale;
    const stringLabelWidth = Math.max(metrics.leftPad * scale - 10, 24);

    return {
      boardHeight: (metrics.boardBottomY - metrics.boardTopY) * scale,
      boardLeft: contentLeft + metrics.boardStartX * scale,
      boardTop: contentTop + metrics.boardTopY * scale,
      boardWidth: (metrics.boardEndX - metrics.boardStartX) * scale,
      openLaneLeft: contentLeft + metrics.leftPad * scale,
      openLaneWidth: metrics.openLaneWidth * scale,
      stringLabelLeft: contentLeft,
      stringLabelTop: contentTop + metrics.boardTopY * scale,
      stringLabelWidth,
      svgHeight: renderedGraphic.height,
      svgLeft: contentLeft,
      svgTop: contentTop,
      svgWidth: renderedGraphic.width,
    };
  }, [metrics, renderedGraphic, showLayoutOverlay, visualSettings]);

  const activePart = activeDrag ? dragHandles.find((handle) => handle.id === activeDrag.id)?.part ?? null : null;

  function startDragging(event, handle) {
    event.preventDefault();
    const pointer = handle.axis === "x" ? event.clientX : event.clientY;
    const currentValue = Number(baseVisualSettings[handle.key]);

    setActiveDrag({
      axis: handle.axis,
      id: handle.id,
      key: handle.key,
      multiplier: handle.multiplier,
      startPointer: pointer,
      startValue: Number.isFinite(currentValue) ? currentValue : 0,
    });
  }

  return (
    // Outer panel padding around the fretboard display. Reduce these values to let the SVG sit closer to the dark rounded panel edge.
    <section
      className={[
        "relative w-full overflow-hidden",
        isSmartphone ? "rounded-[30px]" : shouldUseSimplifiedEditorView ? "rounded-[18px]" : "rounded-[38px]",
      ].join(" ")}
      style={{
        background: visualSettings.fretboardPanelColor,
        border: shouldUseSimplifiedEditorView ? `1px solid ${visualSettings.fretboardPanelColor}` : "none",
        boxShadow: shouldUseSimplifiedEditorView ? "none" : `0 16px 32px ${withAlpha(visualSettings.fretboardPanelColor, 0.12)}`,
        paddingLeft: `${visualSettings.panelPaddingX}px`,
        paddingRight: `${visualSettings.panelPaddingX}px`,
        paddingTop: `${visualSettings.panelPaddingTop}px`,
        paddingBottom: `${visualSettings.panelPaddingBottom}px`,
      }}
    >
      {overlayGuides ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-[30px] border border-dashed"
            style={{
              borderColor: activePart === "panel" ? HANDLE_ACTIVE_COLOR : "rgba(255, 56, 199, 0.76)",
              inset: 0,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-[22px] border border-dashed"
            style={{
              borderColor: activePart === "board" ? HANDLE_ACTIVE_COLOR : "rgba(255, 56, 199, 0.58)",
              bottom: `${overlayGuides.panelBottom}px`,
              left: `${overlayGuides.contentLeft}px`,
              right: `calc(100% - ${overlayGuides.contentRight}px)`,
              top: `${overlayGuides.contentTop}px`,
            }}
          />
          <div
            className="pointer-events-none absolute left-3 top-3 z-10 max-w-[14rem] rounded-[14px] border px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
            style={{
              background: shouldUseSimplifiedEditorView ? "rgba(14, 20, 25, 0.82)" : "rgba(31, 10, 24, 0.72)",
              borderColor: shouldUseSimplifiedEditorView ? "rgba(197, 227, 255, 0.18)" : "rgba(255, 56, 199, 0.26)",
              color: shouldUseSimplifiedEditorView ? "rgba(222, 241, 255, 0.94)" : "rgba(255, 228, 248, 0.94)",
            }}
          >
            {shouldUseSimplifiedEditorView ? "Edit Focus: simplified panel with direct layout guides." : "Drag magenta handles. Active handle turns yellow."}
          </div>
          <DragSchematic activePart={activePart} showOpenLane={model.showOpenStrings} />
          {dragHandles.map((handle) => (
            <DragHandle
              key={handle.id}
              active={activeDrag?.id === handle.id}
              axis={handle.axis}
              calloutLabel={handle.calloutLabel}
              label={handle.label}
              onPointerDown={(event) => startDragging(event, handle)}
              style={handle.style}
            />
          ))}
        </>
      ) : null}

      {geometryOverlay ? (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div
            className="absolute rounded-[20px] border border-dashed"
            style={{
              borderColor: "rgba(90, 120, 255, 0.78)",
              height: `${geometryOverlay.svgHeight}px`,
              left: `${geometryOverlay.svgLeft}px`,
              top: `${geometryOverlay.svgTop}px`,
              width: `${geometryOverlay.svgWidth}px`,
            }}
          >
            <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]" style={{ background: "rgba(90,120,255,0.92)", color: "white" }}>
              SVG box
            </div>
          </div>
          <div
            className="absolute rounded-[18px] border border-dashed"
            style={{
              borderColor: "rgba(0, 187, 125, 0.8)",
              height: `${geometryOverlay.boardHeight}px`,
              left: `${geometryOverlay.boardLeft}px`,
              top: `${geometryOverlay.boardTop}px`,
              width: `${geometryOverlay.boardWidth}px`,
            }}
          >
            <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]" style={{ background: "rgba(0,187,125,0.94)", color: "white" }}>
              Fretboard body
            </div>
          </div>
          {geometryOverlay.openLaneWidth > 1 ? (
            <div
              className="absolute rounded-[12px] border border-dashed"
              style={{
                borderColor: "rgba(255, 145, 0, 0.82)",
                height: `${geometryOverlay.boardHeight}px`,
                left: `${geometryOverlay.openLaneLeft}px`,
                top: `${geometryOverlay.boardTop}px`,
                width: `${geometryOverlay.openLaneWidth}px`,
              }}
            >
              <div className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em]" style={{ background: "rgba(255,145,0,0.94)", color: "white" }}>
                Open lane
              </div>
            </div>
          ) : null}
          <div
            className="absolute rounded-[12px] border border-dashed"
            style={{
              borderColor: "rgba(226, 77, 167, 0.82)",
              height: `${geometryOverlay.boardHeight}px`,
              left: `${geometryOverlay.stringLabelLeft}px`,
              top: `${geometryOverlay.stringLabelTop}px`,
              width: `${geometryOverlay.stringLabelWidth}px`,
            }}
          >
            <div className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em]" style={{ background: "rgba(226,77,167,0.94)", color: "white" }}>
              String labels
            </div>
          </div>
        </div>
      ) : null}

      <div className={frameClassName} ref={frameRef} style={frameStyle}>
        <GraphicFretboard model={model} svgRef={svgRef} visualSettings={visualSettings} />
      </div>
    </section>
  );
}
