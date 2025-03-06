// /types/formTypesEvaluation.ts

// Form data for the evaluation tool
export interface FormData {
  anknytning: {
    narvaro: string;
    dialog1: string;
    dialog2: string;
    blick: string;
    beroring: string;
    konflikt: string;
    fortroende: string;
    comments: Record<string, string>;
  };
  ansvar: {
    impulskontroll: string;
    forberedd: string;
    fokus: string;
    turtagning: string;
    instruktion: string;
    arbeta_sjalv: string;
    tid: string;
    comments: Record<string, string>;
  };
}

// Initial form state
export const initialFormState: FormData = {
  anknytning: {
    narvaro: "",
    dialog1: "",
    dialog2: "",
    blick: "",
    beroring: "",
    konflikt: "",
    fortroende: "",
    comments: {},
  },
  ansvar: {
    impulskontroll: "",
    forberedd: "",
    fokus: "",
    turtagning: "",
    instruktion: "",
    arbeta_sjalv: "",
    tid: "",
    comments: {},
  },
};

// Added from old types file
export interface SubSectionProps {
  title: string;
  name: string;
  options: Array<{
    value: string;
    label: string;
    stage: "ej" | "trans" | "full";
  }>;
  value: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  comment: string;
  sectionKey: keyof FormData;
  fieldName: string;
  calculateProgress: (section: keyof FormData, field: string) => number;
}

export interface ProgressBarProps {
  value: number;
  type: "section" | "total";
  stage?: "ej" | "trans" | "full";
}

/**
 * TextareaProps extends HTMLTextAreaAttributes (without adding new properties)
 * for type consistency across components
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Custom property for project-specific features */
  customProp?: string;
}
