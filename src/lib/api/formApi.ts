// src/lib/api/formApi.ts
import { fetchApi } from "./baseApi";
import { WPCF7Form, WPCF7SubmissionResponse } from "@/lib/types/formTypes";
import { adaptWordPressForm } from "@/lib/adapters/formAdapter";

/**
 * Fetch all available Contact Form 7 forms
 * @returns Array of form objects with basic info
 */
export async function fetchForms() {
  try {
    const forms = await fetchApi("/steget/v1/cf7/forms", {
      revalidate: 3600, // Cache for 1 hour
    });

    return Array.isArray(forms) ? forms : [];
  } catch (error) {
    console.error("Error fetching forms:", error);
    return [];
  }
}

/**
 * Fetch a specific Contact Form 7 form structure
 * @param formId The form ID
 * @returns The form structure or null if not found
 */
export async function fetchFormStructure(
  formId: number
): Promise<WPCF7Form | null> {
  try {
    const form = await fetchApi(`/steget/v1/cf7/form/${formId}`, {
      revalidate: 3600, // Cache for 1 hour
    });

    return adaptWordPressForm(form);
  } catch (error) {
    console.error(`Error fetching form ${formId}:`, error);
    return null;
  }
}

/**
 * Submit data to a Contact Form 7 form
 * @param formId The form ID
 * @param formData The form data to submit
 * @returns The submission response
 */
export async function submitForm(
  formId: number,
  formData: Record<string, string | File>
): Promise<WPCF7SubmissionResponse> {
  try {
    // Validate input
    if (!formId || isNaN(formId)) {
      console.error('Invalid form ID provided:', formId);
      return {
        status: "validation_failed",
        message: "Invalid form ID provided",
      };
    }
    
    // Convert to FormData if there are files
    const hasFiles = Object.values(formData).some(
      (value) => value instanceof File
    );

    if (hasFiles) {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Use fetch directly for FormData
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/steget/v1/cf7/submit/${formId}`,
          {
            method: "POST",
            body: data,
          }
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(
            `Form submission failed: ${response.status} ${response.statusText}. Details: ${errorText}`
          );
        }

        return await response.json();
      } catch (fetchError) {
        console.error(`Error in form fetch operation:`, fetchError);
        throw fetchError;
      }
    }

    // Use fetchApi for regular JSON data
    const response = await fetchApi(`/steget/v1/cf7/submit/${formId}`, {
      method: "POST",
      body: formData,
      revalidate: 0, // Don't cache form submissions
    });
    
    // Ensure the response conforms to WPCF7SubmissionResponse
    if (!('message' in response)) {
      console.warn('API response missing required "message" field:', response);
      return {
        ...response,
        status: typeof response.status === 'number' ? 'mail_failed' : response.status || 'mail_failed',
        message: 'Form submitted but response format was unexpected'
      };
    }
    
    // Convert the response to match WPCF7SubmissionResponse
    return {
      status: typeof response.status === 'string' ? response.status : 'mail_sent',
      message: response.message,
      postedData: response.postedData,
      invalidFields: response.invalidFields,
      into: response.into
    };
  } catch (error) {
    console.error(`Error submitting form ${formId}:`, error);
    return {
      status: "mail_failed",
      message:
        error instanceof Error 
          ? `Error: ${error.message}` 
          : "There was an error submitting the form. Please try again later.",
    };
  }
}

/**
 * Submit a simplified form (less validation, simpler structure)
 * @param formId The form ID
 * @param formData The form data to submit
 * @returns The submission response
 */
export async function submitSimpleForm(
  formId: number,
  formData: Record<string, string>
): Promise<WPCF7SubmissionResponse> {
  try {
    return await fetchApi(`/steget/v1/cf7/simple-submit/${formId}`, {
      method: "POST",
      body: formData,
      revalidate: 0, // Don't cache form submissions
    });
  } catch (error) {
    console.error(`Error submitting simple form ${formId}:`, error);
    return {
      status: "mail_failed",
      message:
        "There was an error submitting the form. Please try again later.",
    };
  }
}
