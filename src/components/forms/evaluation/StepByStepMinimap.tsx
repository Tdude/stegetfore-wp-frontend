'use client';

import React, { useMemo } from 'react';

const MINIMAP_WIDTH_PCT = 7;
const MINIMAP_MIN_WIDTH_REM = 5;
const MINIMAP_MAX_WIDTH_REM = 8;
const ANSWER_COLOR_OPACITY = 0.8;
const UNANSWERED_COLOR = 'rgba(209, 213, 219, 0.8)';
const SEGMENT_COUNT = 5;
const UNSELECTED_SEGMENT_BG = 'rgba(148, 163, 184, 0.18)'; // slate-400-ish

const ANKNYTNING_VERTICAL_MARKERS = [
  { position: 0.4, colorClass: 'bg-orange-500 dark:bg-orange-500' },
  { position: 0.8, colorClass: 'bg-yellow-300 dark:bg-yellow-300' },
];

const ANSVAR_VERTICAL_MARKERS = [
  { position: 0.4, colorClass: 'bg-orange-400 dark:bg-orange-400' },
];

type MinimapRow = {
  sectionId: 'anknytning' | 'ansvar';
  questionId: string;
  questionTitle: string;
  value: string;
};

type StepByStepMinimapProps = {
  rows: MinimapRow[];
  currentQuestionIndex: number;
  onGoToQuestion: (targetIndex: number) => void;
  heightPx: number;
  topOffsetPx: number;
};

const getAnswerColor = (value: string) => {
  if (!value) return UNANSWERED_COLOR;
  const numeric = parseInt(value, 10);
  if (Number.isNaN(numeric)) return UNANSWERED_COLOR;

  const clamped = Math.min(5, Math.max(1, numeric));
  const t = (clamped - 1) / 4;
  const hue = 0 + 120 * t;
  return `hsl(${hue} 80% 45% / ${ANSWER_COLOR_OPACITY})`;
};

const StepByStepMinimap: React.FC<StepByStepMinimapProps> = ({
  rows,
  currentQuestionIndex,
  onGoToQuestion,
  heightPx,
  topOffsetPx
}) => {
  const rowHeights = useMemo(() => {
    const rowCount = Math.max(1, rows.length);
    const available = heightPx > 0 ? Math.max(1, heightPx - 24) : 0;
    const rowHeight = available > 0 ? Math.max(14, Math.floor(available / rowCount) - 4) : 16;
    return { rowHeight };
  }, [heightPx, rows.length]);

  return (
    <div
      className="absolute right-0 hidden sm:block"
      style={{
        top: `${topOffsetPx}px`,
        width: `${MINIMAP_WIDTH_PCT}%`,
        minWidth: `${MINIMAP_MIN_WIDTH_REM}rem`,
        maxWidth: `${MINIMAP_MAX_WIDTH_REM}rem`
      }}
    >
      <div
        className="rounded-lg border border-muted-foreground/20 bg-muted/20 overflow-hidden"
        style={{ height: heightPx > 0 ? `${heightPx}px` : undefined }}
      >
        <div className="h-full">
          <div className="text-xs text-muted-foreground mb-2">Översikt</div>

          <div
            className="relative"
            style={{ height: heightPx > 0 ? `${heightPx - 24}px` : undefined }}
          >
            <div className="flex flex-col items-stretch">
              {rows.map((row, idx) => {
                const isActive = idx === currentQuestionIndex;
                const selectedColor = getAnswerColor(row.value);
                const numeric = parseInt(row.value, 10);
                const selectedIndex = !Number.isNaN(numeric) && numeric >= 1 && numeric <= SEGMENT_COUNT ? numeric - 1 : -1;

                const verticalMarkers = row.sectionId === 'anknytning'
                  ? ANKNYTNING_VERTICAL_MARKERS
                  : ANSVAR_VERTICAL_MARKERS;

                return (
                  <button
                    key={`${row.questionId}:${idx}`}
                    type="button"
                    onClick={() => onGoToQuestion(idx)}
                    title={row.questionTitle}
                    className={`w-full flex items-stretch ${isActive ? 'ring-1 ring-primary ring-inset' : ''}`}
                    style={{ height: `${rowHeights.rowHeight}px` }}
                    aria-label={`Gå till fråga ${idx + 1}`}
                  >
                    <div className="relative w-full h-full overflow-hidden pointer-events-none">
                      {verticalMarkers.map((marker) => (
                        <div
                          key={`${row.questionId}-marker-${marker.position}`}
                          className="absolute inset-y-0"
                          style={{ left: `${marker.position * 100}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className={`w-px h-full ${marker.colorClass}`} />
                        </div>
                      ))}

                      <div className="absolute inset-0 flex">
                        {Array.from({ length: SEGMENT_COUNT }).map((_, segIdx) => {
                          const isFilled = selectedIndex >= 0 && segIdx <= selectedIndex;
                          return (
                            <div
                              key={`${row.questionId}-seg-${segIdx}`}
                              className="h-full flex-1"
                              title={row.questionTitle}
                              style={{
                                backgroundColor: isFilled ? selectedColor : UNSELECTED_SEGMENT_BG,
                                borderRight: segIdx < SEGMENT_COUNT - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : undefined
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepByStepMinimap;
