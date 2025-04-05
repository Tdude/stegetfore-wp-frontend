// src/components/ui/evaluation/ProgressHeader.tsx
import React from 'react';
import { ProgressHeaderProps } from '@/lib/types/formTypesEvaluation';
import { headerStageClasses } from './styles';

/**
 * Progress Header Component
 * Displays the different stages of progress in the evaluation
 */
const ProgressHeader: React.FC<ProgressHeaderProps> = ({ stages }) => {
  return (
    <div className="flex justify-between mb-2">
      {stages.map((stage) => (
        <div
          key={stage.type}
          className={`flex-1 text-center p-2 text-lg font-bold ${headerStageClasses[stage.type]}`}
        >
          {stage.label}
        </div>
      ))}
    </div>
  );
};

export default ProgressHeader;
