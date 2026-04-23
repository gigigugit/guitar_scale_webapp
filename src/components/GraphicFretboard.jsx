import { DEFAULT_FRETBOARD_VISUAL_SETTINGS } from "../lib/fretboardVisualSettings";
import { getChordModeNoteStyle, getScaleModeNoteStyle } from "../lib/fretboardNoteStyles";

const GRAPHIC_FRETBOARD_REFERENCE_FRET_COUNT = 13;

function noteRadius(value, visualSettings) {
  // Controls note-circle radius. Reduce these values to make the markers hug the label text more closely.
  return value.length > 2 ? visualSettings.longNoteRadius : visualSettings.shortNoteRadius;
}

function clampMetric(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function equalTemperedDistance(boundaryValue) {
  return 1 - Math.pow(2, -boundaryValue / 12);
}

function getVerticalBoardMetrics(stringCount, visualSettings) {
  const referenceStringCount = 6;
  const referenceBoardSpan = visualSettings.compactStringGap * (referenceStringCount - 1);
  const stringSegments = Math.max(stringCount - 1, 1);
  const minGap = Math.min(visualSettings.compactStringGap, visualSettings.standardStringGap) * 0.9;
  const maxGap = Math.max(visualSettings.compactStringGap, visualSettings.standardStringGap) * 1.3;
  const spacingScaleRaw = Number(visualSettings.instrumentStringSpacingScale ?? 1);
  const spacingScale = Number.isFinite(spacingScaleRaw) ? spacingScaleRaw : 1;
  const baseRowGap = clampMetric(referenceBoardSpan / stringSegments, minGap, maxGap);
  const rowGap = clampMetric(baseRowGap * spacingScale, minGap * 0.65, maxGap * 1.9);
  const missingStrings = Math.max(referenceStringCount - stringCount, 0);
  const topPad = clampMetric(visualSettings.topPad - missingStrings * 2, 8, visualSettings.topPad);
  const bottomPad = clampMetric(visualSettings.bottomPad - missingStrings * 1.5, 6, visualSettings.bottomPad);

  return {
    rowGap,
    topPad,
    bottomPad,
  };
}

export function getGraphicFretboardMetrics(model, visualSettings = DEFAULT_FRETBOARD_VISUAL_SETTINGS) {
  if (!model || model.strings.length === 0) {
    return null;
  }

  const leftPad = visualSettings.leftPad;
  const rightPad = visualSettings.rightPad;
  const { rowGap, topPad, bottomPad } = getVerticalBoardMetrics(model.strings.length, visualSettings);
  const openLaneWidth = visualSettings.openLaneWidth;
  const fretCount = model.frets.length;
  const referenceFretWidth = Math.max(
    visualSettings.minFretWidth,
    visualSettings.preferredFretWidth - Math.max(GRAPHIC_FRETBOARD_REFERENCE_FRET_COUNT - 8, 0) * visualSettings.extraFretCompression,
  );
  const boardWidth = GRAPHIC_FRETBOARD_REFERENCE_FRET_COUNT * referenceFretWidth;
  const fretWidth = fretCount > 0 ? boardWidth / fretCount : boardWidth;
  const boardStartX = leftPad + openLaneWidth;
  const boardEndX = boardStartX + boardWidth;
  const boardTopY = topPad;
  const boardBottomY = boardTopY + rowGap * (model.strings.length - 1);
  const svgWidth = boardEndX + rightPad;
  const svgHeight = boardBottomY + bottomPad;

  return {
    leftPad,
    topPad,
    rightPad,
    bottomPad,
    rowGap,
    openLaneWidth,
    boardWidth,
    fretCount,
    fretWidth,
    boardStartX,
    boardEndX,
    boardTopY,
    boardBottomY,
    svgWidth,
    svgHeight,
  };
}

export default function GraphicFretboard({ model, svgRef, visualSettings = DEFAULT_FRETBOARD_VISUAL_SETTINGS }) {
  const metrics = getGraphicFretboardMetrics(model, visualSettings);

  if (!metrics) {
    return null;
  }

  // Internal SVG gutter values. These control how much empty space exists around the drawn fretboard.
  const { leftPad, topPad, rightPad, bottomPad, rowGap, openLaneWidth, fretCount, fretWidth, boardStartX, boardEndX, boardTopY, boardBottomY, svgWidth, svgHeight } = metrics;
  const firstVisibleFret = model.showOpenStrings ? 1 : model.startFret;
  const firstVisibleNut = model.showOpenStrings ? 0 : model.startFret;
  const firstVisibleBoundary = model.showOpenStrings ? 0 : model.startFret;
  const fretSpacingMode = visualSettings.fretSpacingMode ?? "uniform";
  const nutLineWidth = Number(visualSettings.nutLineWidth ?? 4);
  const fretLineWidth = Number(visualSettings.fretLineWidth ?? 1.75);
  const stringLineWidth = 1.8;
  const fretBoundaryValues = Array.from({ length: fretCount + 1 }, (_, offset) => (model.showOpenStrings ? offset : model.startFret + offset));
  const fretBoundaryPositions = (() => {
    if (fretSpacingMode !== "tempered") {
      return fretBoundaryValues.map((_, offset) => boardStartX + offset * fretWidth);
    }

    const distances = fretBoundaryValues.map(equalTemperedDistance);
    const startDistance = distances[0] ?? 0;
    const endDistance = distances[distances.length - 1] ?? startDistance;

    if (endDistance <= startDistance) {
      return fretBoundaryValues.map((_, offset) => boardStartX + offset * fretWidth);
    }

    return distances.map((distance) => boardStartX + ((distance - startDistance) / (endDistance - startDistance)) * (boardEndX - boardStartX));
  })();

  const xForBoundaryIndex = (index) => {
    const boundedIndex = Math.min(Math.max(index, 0), fretBoundaryPositions.length - 1);
    return fretBoundaryPositions[boundedIndex];
  };

  const xForBoundaryValue = (boundary) => xForBoundaryIndex(boundary - firstVisibleBoundary);

  const strokeWidthForBoundary = (boundary) => (model.showOpenStrings && boundary === 0 ? nutLineWidth : fretLineWidth);

  const xForNote = (fret) => {
    if (fret === 0 && model.showOpenStrings) {
      return leftPad + openLaneWidth / 2;
    }

    const startBoundaryIndex = Math.max(fret - firstVisibleFret, 0);
    return (xForBoundaryIndex(startBoundaryIndex) + xForBoundaryIndex(startBoundaryIndex + 1)) / 2;
  };

  const xForStringStart = (stringRow) => {
    if (model.showOpenStrings && stringRow.nutFret === 0) {
      return leftPad;
    }

    if (model.showOpenStrings && stringRow.nutFret > 0) {
      return xForNote(stringRow.nutFret);
    }

    const startBoundary = Math.max(stringRow.nutFret, firstVisibleBoundary);
    const startStrokeWidth = stringRow.nutFret > firstVisibleNut ? nutLineWidth : strokeWidthForBoundary(startBoundary);
    return xForBoundaryValue(startBoundary) - startStrokeWidth / 2;
  };

  const lastVisibleBoundary = fretBoundaryValues[fretBoundaryValues.length - 1];
  const stringEndX = xForBoundaryValue(lastVisibleBoundary) + strokeWidthForBoundary(lastVisibleBoundary) / 2;

  const xForStringLabel = (stringRow) => {
    if (stringRow.nutFret > firstVisibleNut) {
      return xForNote(stringRow.nutFret) - 18;
    }

    return leftPad - 10;
  };

  const yForString = (rowIndex) => boardTopY + rowIndex * rowGap;

  const yExtentForLocalNutSegment = (rowIndex) => {
    const currentY = yForString(rowIndex);
    const previousY = rowIndex > 0 ? yForString(rowIndex - 1) : currentY;
    const nextY = rowIndex < model.strings.length - 1 ? yForString(rowIndex + 1) : currentY;

    if (rowIndex === model.strings.length - 1) {
      return {
        bottom: currentY,
        top: previousY,
      };
    }

    return {
      bottom: nextY,
      top: currentY,
    };
  };

  const yExtentForFretBoundary = (fretBoundary) => {
    const activeRowIndices = model.strings.reduce((rows, stringRow, rowIndex) => {
      if (stringRow.nutFret <= fretBoundary) {
        rows.push(rowIndex);
      }

      return rows;
    }, []);

    if (activeRowIndices.length === 0) {
      return null;
    }

    return {
      bottom: yForString(activeRowIndices[activeRowIndices.length - 1]),
      top: yForString(activeRowIndices[0]),
    };
  };

  return (
    <div className="h-full w-full">
      <svg className="block h-full w-full" data-fretboard-svg="true" preserveAspectRatio="xMidYMid meet" ref={svgRef} role="img" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {model.showOpenStrings ? (
          <text
            fill={visualSettings.openFretLabelColor}
            fontFamily={visualSettings.fretboardFontFamily}
            fontSize={visualSettings.openFretLabelSize}
            textAnchor="middle"
            x={leftPad + openLaneWidth / 2}
            y={10}
          >
            0
          </text>
        ) : null}

        {Array.from({ length: fretCount + 1 }, (_, offset) => {
          const x = xForBoundaryIndex(offset);
          const fretBoundary = model.showOpenStrings ? offset : model.startFret + offset;
          const fretLineExtent = yExtentForFretBoundary(fretBoundary);

          return (
            <g key={`fret-boundary-${offset}`}>
              {/* Fret guide line reach above and below the strings. */}
              {fretLineExtent ? <line stroke={visualSettings.fretLineColor} strokeWidth={strokeWidthForBoundary(fretBoundary)} x1={x} x2={x} y1={fretLineExtent.top} y2={fretLineExtent.bottom} /> : null}
              {offset < fretCount ? (
                <text
                  fill={visualSettings.fretNumberColor}
                  fontFamily={visualSettings.fretboardFontFamily}
                  fontSize={visualSettings.fretNumberFontSize}
                  textAnchor="middle"
                  x={(x + xForBoundaryIndex(offset + 1)) / 2}
                  y={10}
                >
                  {/* Fret-number label position above the board. */}
                  {model.showOpenStrings ? offset + 1 : model.startFret + offset}
                </text>
              ) : null}
            </g>
          );
        })}

        {model.strings.map((stringRow, rowIndex) => {
          if (stringRow.nutFret <= firstVisibleNut || !fretBoundaryValues.includes(stringRow.nutFret)) {
            return null;
          }

          const x = xForBoundaryValue(stringRow.nutFret);
          const localNutExtent = yExtentForLocalNutSegment(rowIndex);

          return (
            <line
              key={`local-nut-${stringRow.stringIndex}`}
              stroke={visualSettings.fretLineColor}
              strokeWidth={nutLineWidth}
              x1={x}
              x2={x}
              y1={localNutExtent.top}
              y2={localNutExtent.bottom}
            />
          );
        })}

        {model.strings.map((stringRow, rowIndex) => {
          const stringStartX = xForStringStart(stringRow);

          return (
            <g key={`string-${stringRow.label}-${stringRow.stringIndex}`}>
              {/* String-label placement follows a shortened string's local nut when it is visible. */}
              <text
                fill={visualSettings.stringLabelColor}
                fontFamily={visualSettings.fretboardFontFamily}
                fontSize={visualSettings.stringLabelFontSize}
                textAnchor="end"
                x={xForStringLabel(stringRow)}
                y={yForString(rowIndex) + 4}
              >
                {stringRow.label}
              </text>
              <line
                stroke={visualSettings.stringLineColor}
                strokeWidth={stringLineWidth}
                x1={stringStartX}
                x2={stringEndX}
                y1={yForString(rowIndex)}
                y2={yForString(rowIndex)}
              />
            </g>
          );
        })}

        {model.fretMarkers
          .filter((fret) => !(model.showOpenStrings && fret === 0))
          .map((fret) => {
            const markerX = xForNote(fret);
            const markerY = boardTopY + (boardBottomY - boardTopY) / 2;

            return <circle key={`marker-${fret}`} cx={markerX} cy={markerY} fill={visualSettings.markerColor} opacity={visualSettings.markerOpacity} r="5" />;
          })}

        {model.strings.flatMap((stringRow, rowIndex) =>
          stringRow.notes
            .filter((note) => note.visible ?? note.active)
            .map((note) => {
              const radius = noteRadius(note.value, visualSettings);
              const noteStyle = model.displayTarget === "Chord"
                ? getChordModeNoteStyle(note, visualSettings)
                : getScaleModeNoteStyle(note, visualSettings);

              return (
                <g key={`${stringRow.stringIndex}-${note.fret}-${note.value}`}>
                  {/* Actual note-circle render using the radius returned by noteRadius(). */}
                  <circle cx={xForNote(note.fret)} cy={yForString(rowIndex)} fill={noteStyle.fill} fillOpacity={noteStyle.fillOpacity} r={radius} />
                  <text
                    dominantBaseline="middle"
                    fill={noteStyle.textFill}
                    fillOpacity={noteStyle.textOpacity}
                    fontFamily={visualSettings.fretboardFontFamily}
                    // Controls label size inside each note-circle. Usually adjust this together with noteRadius().
                    fontSize={note.value.length > 1 ? visualSettings.longNoteFontSize : visualSettings.shortNoteFontSize}
                    fontWeight="700"
                    textAnchor="middle"
                    x={xForNote(note.fret)}
                    // Fine vertical alignment for label text inside the note-circle.
                    y={yForString(rowIndex) + 1}
                  >
                    {note.value}
                  </text>
                </g>
              );
            }),
        )}
      </svg>
    </div>
  );
}
