// src/components/ui/evaluation/ProgressBar.tsx
import React from 'react';
import { ProgressBarProps } from '@/lib/types/formTypesEvaluation';

/**
 * Progress Bar component with gradient support
 * Displays progress with color gradients based on value and stage
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ value, type, stage }) => {
  const baseClasses = "h-2 rounded-full transition-all duration-300";
  const typeClasses = type === 'section' ? 'h-1' : 'h-6';

  // Create a gradient color based on the value
  const getProgressColor = (value: number, stage?: 'ej' | 'trans' | 'full') => {
    if (type === 'total' && stage === 'ej') return 'bg-red-500';
    
    // Gradient colors based on value
    if (value < 20) return 'bg-gradient-to-r from-red-600 to-red-400';
    if (value < 40) return 'bg-gradient-to-r from-red-400 to-amber-400';
    if (value < 60) return 'bg-gradient-to-r from-amber-400 to-amber-300';
    if (value < 80) return 'bg-gradient-to-r from-amber-300 to-green-400';
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };

  return (
    <div className="w-full bg-gray-50 rounded-full">
      <div
        className={`${baseClasses} ${typeClasses} ${getProgressColor(value, stage)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;
