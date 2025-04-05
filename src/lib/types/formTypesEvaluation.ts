// /lib/types/formTypesEvaluation.ts

// Base types for questions and options
export interface Option {
  value: string;
  label: string;
  stage: 'ej' | 'trans' | 'full';
}

export interface Question {
  text: string;
  options: Option[];
}

// Form data for student answers
export interface FormSection {
  questions: Record<string, string>;  // questionId -> selected option value
  comments: Record<string, string>;   // questionId -> comment text
}

export interface FormData {
  anknytning: FormSection;
  ansvar: FormSection;
}

// Initial form state with empty sections
export const initialFormState: FormData = {
  anknytning: {
    questions: {},
    comments: {}
  },
  ansvar: {
    questions: {},
    comments: {}
  }
};

// Types for the API response structure (from admin)
export interface QuestionData extends Question {
  id: string;  // Added to track the question ID
}

export interface SubsectionData {
  title?: string;
  questions: Record<string, Question>;
}

export interface SectionData {
  title: string;
  questions: Record<string, Question>;
  subsections?: Record<string, SubsectionData>;
}

export interface QuestionsStructure {
  [sectionId: string]: SectionData;
}

// Response type for student evaluation data
export interface EvaluationResponse {
  id?: number;
  student_id: number;
  title?: string;  // Added to store the evaluation title
  created_at?: string;
  updated_at?: string;
  anknytning?: {
    questions: Record<string, string>;
    comments: Record<string, string>;
  };
  ansvar?: {
    questions: Record<string, string>;
    comments: Record<string, string>;
  };
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
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  comment: string;
  sectionId: keyof FormData;
  calculateProgress: (sectionId: keyof FormData, questionId: string) => number;
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
  studentId?: number | string;
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
