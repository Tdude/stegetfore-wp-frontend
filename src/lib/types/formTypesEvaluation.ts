// /lib/types/formTypesEvaluation.ts

// Form data for the evaluation tool
export interface FormData {
  [sectionId: string]: {
    [questionId: string]: string;
  } & {
    comments?: Record<string, string>;
  };
}

// Initial form state with empty sections
export const initialFormState: FormData = {
  anknytning: {
    comments: {} as Record<string, string>,
  } as { [questionId: string]: string } & { comments?: Record<string, string> },
  ansvar: {
    comments: {} as Record<string, string>,
  } as { [questionId: string]: string } & { comments?: Record<string, string> },
};

// Types for the API response structure
export interface Question {
  text: string;
  options: Array<{
    value: string;
    label: string;
    stage: 'ej' | 'trans' | 'full';
  }>;
}

export interface SectionData {
  title: string;
  questions: Record<string, Question>;
}

export interface QuestionsStructure {
  [sectionId: string]: SectionData;
}


/**
 * Props for the progress bar component
 */
export interface ProgressBarProps {
  value: number;
  type: "section" | "total";
  stage?: "ej" | "trans" | "full";
}

/**
 * Props for the SubSection component
 */
export interface SubSectionProps {
  title: string;
  questionId: string;
  options: Array<{
    value: string;
    label: string;
    stage: "ej" | "trans" | "full";
  }>;
  value: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  comment: string;
  sectionId: string;
  calculateProgress: (sectionId: string, questionId: string) => number;
}

/**
 * Props for the ProgressHeader component
 */
export interface ProgressHeaderProps {
  stages: Array<{
    label: string;
    type: 'ej' | 'trans' | 'full';
  }>;
}

/**
 * Props for the StudentEvaluationForm component
 */
export interface StudentEvaluationFormProps {
  studentId: number;
  evaluationId?: number;
}

/**
 * Utility type for styled components
 */
export interface StageClasses {
  ej: string;
  trans: string;
  full: string;
}
