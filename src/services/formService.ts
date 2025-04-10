// src/services/formService.ts
import {
  WPCF7Form,
  WPCF7Field,
  WPCF7SubmissionResponse,
  FormValidationState,
} from "@/lib/types";
import { fetchFormStructure, submitForm, submitSimpleForm } from "@/lib/api";
import { formatFormDataForSubmission } from "@/lib/adapters";

/**
 * Validates form data against form structure
 * @param formData Form data to validate
 * @param form Form structure
 * @returns Validation result with errors if any
 */
export function validateFormData(
  formData: Record<string, any>,
  form: WPCF7Form
): FormValidationState {
  const errors: Record<string, string> = {};
  const touched: Record<string, boolean> = {};

  // Process each field in the form
  form.fields.forEach((field) => {
    const value = formData[field.name];
    touched[field.name] = true;

    // Required field validation
    if (
      field.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      errors[field.name] = "This field is required";
      return;
    }

    // Skip further validation if field is empty and not required
    if (!value && !field.required) {
      return;
    }

    // Email validation
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.name] = "Please enter a valid email address";
      }
    }

    // URL validation
    if (field.type === "url" && value) {
      try {
        new URL(value);
      } catch (e) {
        errors[field.name] = "Please enter a valid URL";
      }
    }

    // Number validation
    if (field.type === "number" && value) {
      const num = Number(value);

      if (isNaN(num)) {
        errors[field.name] = "Please enter a valid number";
      } else {
        if (field.min !== undefined && num < Number(field.min)) {
          errors[
            field.name
          ] = `Please enter a number greater than or equal to ${field.min}`;
        }
        if (field.max !== undefined && num > Number(field.max)) {
          errors[
            field.name
          ] = `Please enter a number less than or equal to ${field.max}`;
        }
      }
    }

    // Text length validation
    if ((field.type === "text" || field.type === "textarea") && value) {
      if (field.min !== undefined && value.length < Number(field.min)) {
        errors[field.name] = `Please enter at least ${field.min} characters`;
      }
      if (field.max !== undefined && value.length > Number(field.max)) {
        errors[
          field.name
        ] = `Please enter no more than ${field.max} characters`;
      }
    }

    // File validation
    if (field.type === "file" && value instanceof File) {
      const fileExtension = value.name.split(".").pop()?.toLowerCase();

      // Check file size
      if (field.max && value.size > Number(field.max) * 1024 * 1024) {
        // Convert MB to bytes
        errors[field.name] = `File size should not exceed ${field.max}MB`;
      }

      // Check file type if specified in field options
      if (field.options?.length) {
        const allowedTypes = field.options.map((type) => type.toLowerCase());
        if (fileExtension && !allowedTypes.includes(`.${fileExtension}`)) {
          errors[
            field.name
          ] = `Invalid file type. Allowed types: ${field.options.join(", ")}`;
        }
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    touched,
  };
}

/**
 * Creates initial form values from form structure
 * @param form Form structure
 * @returns Initial form values
 */
export function createInitialFormValues(form: WPCF7Form): Record<string, any> {
  const initialValues: Record<string, any> = {};

  form.fields.forEach((field) => {
    if (field.type === "checkbox" || field.type === "radio") {
      // Use default values if specified, otherwise empty array for checkboxes
      initialValues[field.name] = field.default_value
        ? [field.default_value]
        : field.type === "checkbox"
        ? []
        : "";
    } else if (field.type === "select" && field.multiple) {
      // Multiple select gets an array
      initialValues[field.name] = field.default_value
        ? [field.default_value]
        : [];
    } else {
      // Text fields, textareas, etc.
      initialValues[field.name] = field.default_value || "";
    }
  });

  return initialValues;
}

/**
 * Submits a form with validation
 * @param formId Form ID
 * @param formData Form data to submit
 * @param useSimpleSubmit Whether to use the simple submission endpoint
 * @returns Submission response
 */
export async function submitFormWithValidation(
  formId: number,
  formData: Record<string, any>,
  useSimpleSubmit: boolean = false
): Promise<{
  success: boolean;
  message: string;
  validationResult?: FormValidationState;
  response?: WPCF7SubmissionResponse;
}> {
  try {
    // Fetch form structure for validation
    const form = await fetchFormStructure(formId);

    if (!form) {
      return {
        success: false,
        message: "Form structure could not be loaded",
      };
    }

    // Validate form data
    const validationResult = validateFormData(formData, form);

    if (!validationResult.isValid) {
      return {
        success: false,
        message: "Please fix the validation errors",
        validationResult,
      };
    }

    // Format data for submission
    const formattedData = formatFormDataForSubmission(formData);

    // Submit the form
    const response = useSimpleSubmit
      ? await submitSimpleForm(formId, formattedData as Record<string, string>)
      : await submitForm(formId, formattedData);

    // Check response status
    const success = response.status === "mail_sent";

    return {
      success,
      message: response.message,
      response,
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      message: "An unexpected error occurred while submitting the form",
    };
  }
}

/**
 * Gets field validation error message
 * @param field Field definition
 * @param error Error type
 * @returns Custom or default error message
 */
export function getFieldErrorMessage(field: WPCF7Field, error: string): string {
  // Check for custom validation message
  if (field.validation_messages && field.validation_messages[error]) {
    return field.validation_messages[error];
  }

  // Default error messages
  switch (error) {
    case "required":
      return "This field is required";
    case "email":
      return "Please enter a valid email address";
    case "url":
      return "Please enter a valid URL";
    case "number":
      return "Please enter a valid number";
    case "min":
      return `Minimum value is ${field.min}`;
    case "max":
      return `Maximum value is ${field.max}`;
    case "minlength":
      return `Please enter at least ${field.min} characters`;
    case "maxlength":
      return `Please enter no more than ${field.max} characters`;
    case "file":
      return "Please select a valid file";
    default:
      return "Invalid value";
  }
}
