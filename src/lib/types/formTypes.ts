// src/lib/types/formTypes.ts

/**
 * Contact Form 7 field
 */
export interface WPCF7Field {
  id: string;
  type: string;
  basetype: string;
  name: string;
  required: boolean;
  placeholder?: string;
  raw_values: string[];
  values: string[];
  labels: string[];
  options?: string[];
  default_value?: string;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  class?: string[];
  readonly?: boolean;
  disabled?: boolean;
  size?: number;
  error_message?: string;
  validation_messages?: Record<string, string>;
}

/**
 * Contact Form 7 form structure
 */
export interface WPCF7Form {
  id: string;
  title: string;
  fields: WPCF7Field[];
  additional_settings: string;
  locale?: string;
  messages?: {
    mail_sent_ok: string;
    mail_sent_ng: string;
    validation_error: string;
    spam: string;
    accept_terms: string;
    invalid_required: string;
    invalid_too_long: string;
    invalid_too_short: string;
    upload_failed: string;
    upload_file_type_invalid: string;
    upload_file_too_large: string;
    upload_failed_php_error: string;
    invalid_date: string;
    date_too_early: string;
    date_too_late: string;
    invalid_number: string;
    number_too_small: string;
    number_too_large: string;
    quiz_answer_not_correct: string;
    invalid_email: string;
    invalid_url: string;
    invalid_tel: string;
    captcha_not_match: string;
    [key: string]: string;
  };
}

/**
 * Contact Form 7 form submission response
 */
export interface WPCF7SubmissionResponse {
  status:
    | "mail_sent"
    | "mail_failed"
    | "validation_failed"
    | "spam"
    | "aborted"
    | "unaccepted_terms"
    | string;
  message: string;
  postedData?: Record<string, string>;
  invalidFields?: Array<{
    field: string;
    message: string;
  }>;
  into?: string;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

/**
 * Form field props for use in form components
 */
export interface FormFieldProps {
  id: string;
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: string | string[] | File | null;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onBlur?: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  error?: string;
  className?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  accept?: string;
}

/**
 * Form props for the dynamic form component
 */
export interface DynamicFormProps {
  form: WPCF7Form;
  onSubmit: (formData: Record<string, string | File>) => Promise<void>;
  initialValues?: Record<string, string | string[] | File | null>;
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  isSubmitting?: boolean;
  className?: string;
  fieldClassName?: string;
}

/**
 * Textarea props extension for form textarea component
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  customProp?: string;
}
