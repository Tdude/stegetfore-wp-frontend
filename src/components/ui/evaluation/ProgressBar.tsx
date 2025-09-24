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
  } else if (value < 0.55) {
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
      className="absolute top-0 transform -translate-y-full"
      style={{ left: `${positionPercent}%` }}
    >
      <div className="bg-card dark:bg-surface-secondary border border-border dark:border-panel-border rounded-full px-2 py-0.5 text-xs font-medium shadow-sm dark:shadow-dark-sm whitespace-nowrap text-foreground">
        {label}
      </div>
      <div className="w-0.5 h-3 bg-gray-400 dark:bg-gray-500 mx-auto mt-0.5"></div>
    </div>
  );
};

/**
 * Dual section progress bar component
 * Shows two independent progress bars (anknytning & ansvar) side by side
 */
export const DualSectionProgressBar: React.FC<{
  anknytningProgress: number;
  ansvarProgress: number;
}> = ({ anknytningProgress, ansvarProgress }) => {
  return (
    <div className="w-full mb-8 mt-4">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <h3 className="text-md font-medium mb-8 dark:text-primary">Anknytningstecken</h3>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">{Math.round(anknytningProgress * 100)}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-6 rounded-full bg-gray-200 dark:surface-tertiary overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  anknytningProgress < 0.55 ? progressGradients.low :
                  anknytningProgress < 0.7 ? progressGradients.medium : progressGradients.high
                )}
                style={{ width: `${Math.round(anknytningProgress * 100)}%` }}
              />
            </div>
            {/* Marker pills for anknytning - positioned at 1/3 and 2/3 */}
            <MarkerPill position={0.15} label="Ej ankuten" />
            <MarkerPill position={0.45} label="Ankuten" />
            <MarkerPill position={0.73} label="Spiller över" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-md font-medium mb-8 dark:text-primary">Ansvarstecken</h3>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">{Math.round(ansvarProgress * 100)}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-6 rounded-full bg-gray-200 dark:surface-tertiary overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  ansvarProgress < 0.5 ? progressGradients.low :
                  ansvarProgress < 0.7 ? progressGradients.medium : progressGradients.high
                )}
                style={{ width: `${Math.round(ansvarProgress * 100)}%` }}
              />
            </div>
            {/* Middle marker pill for ansvar */}
            <MarkerPill position={0.3} label="Ej elev" />
            <MarkerPill position={0.55} label="Elev" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
