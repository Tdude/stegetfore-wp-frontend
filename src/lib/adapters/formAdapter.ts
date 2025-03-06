// src/lib/adapters/formAdapter.ts
import { WPCF7Form, WPCF7Field } from "@/lib/types";

/**
 * Adapts a WordPress Contact Form 7 form to the application WPCF7Form format
 * @param wpForm WordPress form data
 * @returns WPCF7Form object formatted for the application
 */
export function adaptWordPressForm(wpForm: any): WPCF7Form {
  if (!wpForm) return null;

  return {
    id: wpForm.id || "",
    title: wpForm.title || "",
    fields: Array.isArray(wpForm.fields)
      ? wpForm.fields.map((field: any) => adaptWordPressFormField(field))
      : [],
    additional_settings: wpForm.additional_settings || "",
    locale: wpForm.locale,
    messages: wpForm.messages || {},
  };
}

/**
 * Adapts a WordPress Contact Form 7 field to the application WPCF7Field format
 * @param wpField WordPress form field data
 * @returns WPCF7Field object formatted for the application
 */
function adaptWordPressFormField(wpField: any): WPCF7Field {
  return {
    id: wpField.id || "",
    type: wpField.type || "",
    basetype: wpField.basetype || "",
    name: wpField.name || "",
    required: wpField.required || false,
    placeholder: wpField.placeholder || "",
    raw_values: Array.isArray(wpField.raw_values) ? wpField.raw_values : [],
    values: Array.isArray(wpField.values) ? wpField.values : [],
    labels: Array.isArray(wpField.labels) ? wpField.labels : [],
    options: wpField.options,
    default_value: wpField.default_value,
    min: wpField.min,
    max: wpField.max,
    step: wpField.step,
    multiple: wpField.multiple,
    class: wpField.class,
    readonly: wpField.readonly,
    disabled: wpField.disabled,
    size: wpField.size,
    error_message: wpField.error_message,
    validation_messages: wpField.validation_messages || {},
  };
}

/**
 * Formats form data for submission to the Contact Form 7 API
 * @param formData Form data collected from form inputs
 * @returns Formatted form data ready for API submission
 */
export function formatFormDataForSubmission(
  formData: Record<string, any>
): Record<string, string | File> {
  const formattedData: Record<string, string | File> = {};

  // Process each field in the form data
  Object.entries(formData).forEach(([key, value]) => {
    // Handle arrays (like checkboxes or multi-selects)
    if (Array.isArray(value)) {
      formattedData[key] = value.join(",");
    }
    // Handle File objects
    else if (value instanceof File) {
      formattedData[key] = value;
    }
    // Handle all other types (convert to string)
    else {
      formattedData[key] = String(value);
    }
  });

  return formattedData;
}
