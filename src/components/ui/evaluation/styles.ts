// src/components/ui/evaluation/styles.ts
import { StageClasses } from '@/lib/types/formTypesEvaluation';

// Styling classes for different stages
export const stageClasses: StageClasses = {
  ej: 'relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-red-300 before:to-amber-200 before:rounded mt-0 first:mt-0',
  trans: 'relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-200 before:to-green-200 before:rounded mt-0 first:mt-0',
  full: 'relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-green-200 before:rounded mt-0 first:mt-0'
};

// Header stage classes
export const headerStageClasses = {
  ej: 'border-b-4 border-red-200 dark:border-red-300/50',
  trans: 'border-b-4 border-amber-200 dark:border-amber-300/50',
  full: 'border-b-4 border-green-200 dark:border-green-300/50'
};

// CSS classes for different stages in question card
export const questionStageClasses = {
  "1": "mb-4",
  "2": "mb-4",
  "3": "mb-4"
};

// Get option classes based on selection state
export const getOptionClasses = (isSelected: boolean): string => {
  return `flex items-center border-2 space-x-4 p-3 rounded-md cursor-pointer transition-all duration-300 relative mb-0 ${
    isSelected
      ? 'bg-primary/10 border-2 border-primary/20 shadow-md dark:bg-primary/20 dark:border-primary/30 dark:shadow-dark-sm' 
      : 'hover:bg-surface-tertiary border border-transparent dark:hover:bg-surface-tertiary'
  }`;
};
