import { DEFAULT_FRETBOARD_VISUAL_SETTINGS } from "../lib/fretboardVisualSettings";

function noteRadius(value, visualSettings) {
  // Controls note-circle radius. Reduce these values to make the markers hug the label text more closely.
  return value.length > 2 ? visualSettings.longNoteRadius : visualSettings.shortNoteRadius;
}

function clampMetric(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getVerticalBoardMetrics(stringCount, visualSettings) {
  const referenceStringCount = 6;
  const referenceBoardSpan = visualSettings.compactStringGap * (referenceStringCount - 1);
  const stringSegments = Math.max(stringCount - 1, 1);
  const minGap = Math.min(visualSettings.compactStringGap, visualSettings.standardStringGap) * 0.9;
  const maxGap = Math.max(visualSettings.compactStringGap, visualSettings.standardStringGap) * 1.3;
  const rowGap = clampMetric(referenceBoardSpan / stringSegments, minGap, maxGap);
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
  const openLaneWidth = model.showOpenStrings ? visualSettings.openLaneWidth : 0;
  const fretCount = model.frets.length;
  const fretWidth = Math.max(visualSettings.minFretWidth, visualSettings.preferredFretWidth - Math.max(fretCount - 8, 0) * visualSettings.extraFretCompression);
  const boardStartX = leftPad + openLaneWidth;
  const boardEndX = boardStartX + fretCount * fretWidth;
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

export default function GraphicFretboard({ model, visualSettings = DEFAULT_FRETBOARD_VISUAL_SETTINGS }) {
  const metrics = getGraphicFretboardMetrics(model, visualSettings);

  if (!metrics) {
    return null;
  }

  // Internal SVG gutter values. These control how much empty space exists around the drawn fretboard.
  const { leftPad, topPad, rightPad, bottomPad, rowGap, openLaneWidth, fretCount, fretWidth, boardStartX, boardEndX, boardTopY, boardBottomY, svgWidth, svgHeight } = metrics;

  const xForNote = (fret) => {
    if (fret === 0 && model.showOpenStrings) {
      return leftPad + openLaneWidth / 2;
    }

    const firstFretted = model.showOpenStrings ? 1 : model.startFret;
    return boardStartX + (fret - firstFretted + 0.5) * fretWidth;
  };

  const yForString = (rowIndex) => boardTopY + rowIndex * rowGap;

  return (
    <div className="h-full w-full">
      <svg className="block h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {model.strings.map((stringRow, rowIndex) => (
          <g key={`string-${stringRow.label}-${stringRow.stringIndex}`}>
            {/* Left string-label placement. Tighten this offset to reduce the left gutter. */}
            <text
              fill={visualSettings.stringLabelColor}
              fontFamily={visualSettings.fretboardFontFamily}
              fontSize={visualSettings.stringLabelFontSize}
              textAnchor="end"
              x={leftPad - 10}
              y={yForString(rowIndex) + 4}
            >
              {stringRow.label}
            </text>
            <line
              stroke={visualSettings.stringLineColor}
              strokeWidth={1.8}
              x1={leftPad}
              x2={boardEndX}
              y1={yForString(rowIndex)}
              y2={yForString(rowIndex)}
            />
          </g>
        ))}

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
          const x = boardStartX + offset * fretWidth;
          const fretNumber = model.showOpenStrings ? offset + 1 : model.startFret + offset;

          return (
            <g key={`fret-boundary-${offset}`}>
              {/* Fret guide line reach above and below the strings. */}
              <line stroke={visualSettings.fretLineColor} strokeWidth={model.showOpenStrings && offset === 0 ? 4 : 1.75} x1={x} x2={x} y1={boardTopY - 5} y2={boardBottomY + 8} />
              {offset < fretCount ? (
                <text
                  fill={visualSettings.fretNumberColor}
                  fontFamily={visualSettings.fretboardFontFamily}
                  fontSize={visualSettings.fretNumberFontSize}
                  textAnchor="middle"
                  x={x + fretWidth / 2}
                  y={10}
                >
                  {/* Fret-number label position above the board. */}
                  {model.showOpenStrings ? offset + 1 : model.startFret + offset}
                </text>
              ) : null}
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
            .filter((note) => note.active)
            .map((note) => {
              const radius = noteRadius(note.value, visualSettings);

              return (
                <g key={`${stringRow.stringIndex}-${note.fret}-${note.value}`}>
                  {/* Actual note-circle render using the radius returned by noteRadius(). */}
                  <circle cx={xForNote(note.fret)} cy={yForString(rowIndex)} fill={visualSettings.noteFillColor} r={radius} />
                  <text
                    dominantBaseline="middle"
                    fill={visualSettings.noteTextColor}
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