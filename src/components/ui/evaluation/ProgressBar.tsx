// src/components/ui/evaluation/ProgressBar.tsx
import { ProgressBarProps } from '@/lib/types/formTypesEvaluation';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Progress bar gradient classes to match original styling with intricate cross-fading
 * Enhanced with dark mode support
 */
const progressGradients = {
  low: 'bg-gradient-to-r from-red-400 via-red-300 to-amber-200 dark:from-red-500/70 dark:via-red-400/70 dark:to-amber-300/70',
  medium: 'bg-gradient-to-r from-amber-300 via-amber-200 to-green-200 dark:from-amber-400/70 dark:via-amber-300/70 dark:to-green-300/70',
  high: 'bg-gradient-to-r from-amber-200 via-green-300 to-green-400 dark:from-amber-300/70 dark:via-green-400/70 dark:to-green-500/70',
  complete: 'bg-gradient-to-r from-green-300 via-green-400 to-green-500 dark:from-green-400/70 dark:via-green-500/70 dark:to-green-600/70'
};

// Dual-section bar visual constants (shared unless we later split per section)
const DUAL_ZERO_DOT_WIDTH = 15;   // visual width when only zero scores so far
const DUAL_MIN_PROGRESS_WIDTH = 15; // width just after the first non-zero score (slightly "opened" dot)
const DUAL_WIDTH_FACTOR = 100; // how much avg contributes to width in % units

// Base colour tuples for the dual-section bars
const DUAL_LIGHT_RED: [number, number, number] = [250, 200, 200];
const DUAL_DARK_RED: [number, number, number] = [150, 20, 25];
const DUAL_ORANGE: [number, number, number] = [240, 180, 10];
const DUAL_AMBER: [number, number, number] = [230, 240, 100];
const DUAL_GREEN: [number, number, number] = [20, 160, 80];

// Avg thresholds for colour transitions in the dual-section bars
const DUAL_AVG_THRESHOLD_LOW = 0.3;
const DUAL_AVG_THRESHOLD_MID = 0.4;

// Marker defaults and per-section marker configs
const DEFAULT_VERTICAL_MARKER_COLOR = 'bg-orange-500 dark:bg-orange-500';

const ANKNYTNING_VERTICAL_MARKERS = [
  { position: 0.4, colorClass: 'bg-orange-500 dark:bg-orange-500' },
  { position: 0.8, colorClass: 'bg-yellow-300 dark:bg-yellow-300' },
];

const ANKNYTNING_PILLS = [
  { position: 0.1, label: 'Ej ankuten' },
  { position: 0.5, label: 'Ankuten' },
  { position: 0.78, label: 'Spiller över' },
];

const ANSVAR_VERTICAL_MARKERS = [
  { position: 0.4, colorClass: 'bg-orange-400 dark:bg-orange-400' },
];

const ANSVAR_PILLS = [
  { position: 0.1, label: 'Ännu ej elev' },
  { position: 0.63, label: 'Elev' },
];

/**
 * Progress bar component used to display progress in the evaluation form
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value = 0, 
  type = 'section', 
  stage,
  label,
  showLabel = false
}) => {
  // Ensure value is between 0 and 1
  const normalizedValue = Math.max(0, Math.min(value, 1));
  const percentage = Math.round(normalizedValue * 100);
  

  let gradientClass = '';
  if (stage === 'ej') {
    gradientClass = progressGradients.low;
  } else if (stage === 'trans') {
    gradientClass = progressGradients.medium;
  } else if (stage === 'full') {
    gradientClass = progressGradients.complete;
  } else if (value < 0.5) {
    gradientClass = progressGradients.low;
  } else if (value < 0.7) {
    gradientClass = progressGradients.medium;
  } else {
    gradientClass = progressGradients.complete;
  }
  
  // Set bar height based on type
  const barHeight = type === 'total' ? 'h-6' : 'h-2';
  
  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="mb-1 text-sm font-medium">{label} ({percentage}%)</div>
      )}
      <div className={cn(
        "w-full rounded-full bg-gray-200 overflow-hidden",
        type === 'total' ? 'mb-4' : 'mb-2',
        barHeight
      )}>
        <div 
          className={cn("h-full rounded-full transition-all duration-300", gradientClass)}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

/**
 * Marker pill component for progress bar
 */
const MarkerPill: React.FC<{
  position: number; // 0 to 1
  label: string;
}> = ({ position, label }) => {
  // Ensure position is between 0 and 1
  const normalizedPosition = Math.max(0, Math.min(position, 1));
  const positionPercent = normalizedPosition * 100;
  
  return (
    <div 
      className="absolute top-0 transform -translate-y-full -mt-2"
      style={{ left: `${positionPercent}%` }}
    >
      <div className="bg-card dark:bg-surface-secondary border border-border dark:border-panel-border rounded-full px-2 py-0.5 text-xs font-medium shadow-sm dark:shadow-dark-sm whitespace-nowrap text-foreground">
        {label}
      </div>
    </div>
  );
};

/**
 * Vertical marker component to indicate thresholds between pills
 */
const VerticalMarker: React.FC<{
  position: number; // 0 to 1
  colorClass?: string;
}> = ({ position, colorClass = DEFAULT_VERTICAL_MARKER_COLOR }) => {
  const normalizedPosition = Math.max(0, Math.min(position, 1));
  const positionPercent = normalizedPosition * 100;

  return (
    <div
      className="absolute inset-y-0 flex justify-center"
      style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
    >
      <div className={`w-1 h-full ${colorClass}`}></div>
    </div>
  );
};

type SectionStats = {
  totalQuestions: number;
  answered: number;
  nonZero: number;
  avg: number;
};

/**
 * Dual section progress bar component
 * Shows two independent progress bars (anknytning & ansvar) side by side
 */
export const DualSectionProgressBar: React.FC<{
  anknytningStats: SectionStats;
  ansvarStats: SectionStats;
}> = ({ anknytningStats, ansvarStats }) => {
  const computeVisual = (stats: SectionStats) => {
    const { totalQuestions, answered, nonZero, avg } = stats;

    if (!totalQuestions || answered === 0) {
      // No answers yet: no inner bar
      return { show: false, widthPercent: 0, color: '' };
    }

    const answeredRatio = totalQuestions > 0 ? answered / totalQuestions : 0;

    // Base red darkens as more questions are answered, regardless of score
    const lightRed = DUAL_LIGHT_RED;
    const darkRed = DUAL_DARK_RED;
    const baseRedTuple = [
      Math.round(lightRed[0] + (darkRed[0] - lightRed[0]) * answeredRatio),
      Math.round(lightRed[1] + (darkRed[1] - lightRed[1]) * answeredRatio),
      Math.round(lightRed[2] + (darkRed[2] - lightRed[2]) * answeredRatio),
    ] as [number, number, number];
    const baseRed = `rgb(${baseRedTuple[0]}, ${baseRedTuple[1]}, ${baseRedTuple[2]})`;

    if (nonZero === 0) {
      // State B: all answers so far are zero → fixed-width red dot, darkening with answered count
      return {
        show: true,
        widthPercent: DUAL_ZERO_DOT_WIDTH,
        color: baseRed,
      };
    }

    // State C: at least one non-zero score
    // Increase width more noticeably based on avg, always at least MIN_PROGRESS_WIDTH
    const clampedAvg = Math.max(0, Math.min(avg, 1));
    let widthPercent = DUAL_MIN_PROGRESS_WIDTH + DUAL_WIDTH_FACTOR * clampedAvg;
    if (widthPercent > 100) {
      widthPercent = 100;
    }

    // Color progression for non-zero scores:
    // low avg  -> deep red
    // mid avg  -> orange / amber
    // high avg -> green
    const redTuple: [number, number, number] = baseRedTuple;          // deepening red based on answeredRatio
    const orange: [number, number, number] = DUAL_ORANGE;          // amber-400-ish
    const amber: [number, number, number] = DUAL_AMBER;           // amber-300-ish
    const green: [number, number, number] = DUAL_GREEN;            // green-500-ish

    let colorTuple: [number, number, number];

    if (clampedAvg < DUAL_AVG_THRESHOLD_LOW) {
      // From red towards orange
      const t = clampedAvg / DUAL_AVG_THRESHOLD_LOW;
      colorTuple = [
        Math.round(redTuple[0] + (orange[0] - redTuple[0]) * t),
        Math.round(redTuple[1] + (orange[1] - redTuple[1]) * t),
        Math.round(redTuple[2] + (orange[2] - redTuple[2]) * t),
      ];
    } else if (clampedAvg < DUAL_AVG_THRESHOLD_MID) {
      // From orange to amber
      const t = (clampedAvg - DUAL_AVG_THRESHOLD_LOW) / (DUAL_AVG_THRESHOLD_MID - DUAL_AVG_THRESHOLD_LOW);
      colorTuple = [
        Math.round(orange[0] + (amber[0] - orange[0]) * t),
        Math.round(orange[1] + (amber[1] - orange[1]) * t),
        Math.round(orange[2] + (amber[2] - orange[2]) * t),
      ];
    } else {
      // From amber to green
      const t = (clampedAvg - DUAL_AVG_THRESHOLD_MID) / (1 - DUAL_AVG_THRESHOLD_MID);
      colorTuple = [
        Math.round(amber[0] + (green[0] - amber[0]) * t),
        Math.round(amber[1] + (green[1] - amber[1]) * t),
        Math.round(amber[2] + (green[2] - amber[2]) * t),
      ];
    }

    const color = `rgb(${colorTuple[0]}, ${colorTuple[1]}, ${colorTuple[2]})`;

    return {
      show: true,
      widthPercent,
      color,
    };
  };

  // Anknytning and Ansvar currently share the same visual scaling; keep them separate if we later need different configs
  const anknytningVisual = computeVisual(anknytningStats);
  const ansvarVisual = computeVisual(ansvarStats);

  return (
    <div className="w-full mb-8 mt-4">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <h3 className="text-md font-medium mb-8 dark:text-primary">Anknytningstecken</h3>
          <div className="flex justify-between items-center mb-2">
          </div>
          <div className="relative">
            <div className="w-full h-6 rounded-full bg-gray-200 dark:surface-tertiary overflow-hidden">
              {anknytningVisual.show && (
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${anknytningVisual.widthPercent}%`,
                    backgroundColor: anknytningVisual.color,
                  }}
                />
              )}
            </div>
            {/* Vertical markers between pills for anknytning */}
            {ANKNYTNING_VERTICAL_MARKERS.map((marker) => (
              <VerticalMarker
                key={`anknytning-marker-${marker.position}`}
                position={marker.position}
                colorClass={marker.colorClass}
              />
            ))}
            {/* Marker pills for anknytning */}
            {ANKNYTNING_PILLS.map((pill) => (
              <MarkerPill
                key={`anknytning-pill-${pill.position}`}
                position={pill.position}
                label={pill.label}
              />
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-md font-medium mb-8 dark:text-primary">Ansvarstecken</h3>
          <div className="flex justify-between items-center mb-1">
          </div>
          <div className="relative">
            <div className="w-full h-6 rounded-full bg-gray-200 dark:surface-tertiary overflow-hidden">
              {ansvarVisual.show && (
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${ansvarVisual.widthPercent}%`,
                    backgroundColor: ansvarVisual.color,
                  }}
                />
              )}
            </div>
            {/* Single vertical marker between ansvar pills (approx. middle) */}
            {ANSVAR_VERTICAL_MARKERS.map((marker) => (
              <VerticalMarker
                key={`ansvar-marker-${marker.position}`}
                position={marker.position}
                colorClass={marker.colorClass}
              />
            ))}
            {/* Marker pills for ansvar */}
            {ANSVAR_PILLS.map((pill) => (
              <MarkerPill
                key={`ansvar-pill-${pill.position}`}
                position={pill.position}
                label={pill.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
