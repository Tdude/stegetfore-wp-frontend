// NOT USED: This form component is not currently wired up or rendered in the app. See ContactForm.tsx for the active contact form.

// src/components/forms/DynamicForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { validateFormData, createInitialFormValues } from '@/services';
import { formatFormDataForSubmission } from '@/lib/adapters';
import { submitForm } from '@/lib/api';
import { WPCF7Field, WPCF7Form } from '@/lib/types/wpTypes';
import { launchConfetti } from '@/lib/utils/confetti';
import CenteredToast from '@/components/CenteredToast';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DynamicFormProps {
  form: WPCF7Form;
  onSubmit?: (formData: Record<string, string | File>) => Promise<void>;
  initialValues?: Record<string, string | string[] | File | null>;
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  fieldClassName?: string;
}

export default function DynamicForm({
  form,
  onSubmit,
  initialValues,
  submitButtonText = 'Submit',
  successMessage = 'Form submitted successfully',
  errorMessage = 'There was an error submitting the form',
  className = '',
  fieldClassName = '',
}: DynamicFormProps) {
  // Initialize form state
  const [formData, setFormData] = useState<Record<string, string | number | boolean | null>>(() => {
    return initialValues || createInitialFormValues(form);
  });

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [centeredToastOpen, setCenteredToastOpen] = useState(false);

  // Update form data when initialValues changes
  useEffect(() => {
    if (initialValues) {
      setFormData(prevData => ({
        ...prevData,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  // Handle input changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    // Handle checkboxes and multi-selects specially
    if (type === 'checkbox') {
      const checkbox = event.target as HTMLInputElement;
      const isChecked = checkbox.checked;

      setFormData(prevData => {
        const prevArray = Array.isArray(prevData[name]) ? prevData[name] : [];
        if (isChecked) {
          return {
            ...prevData,
            [name]: [...prevArray, value],
          };
        } else {
          return {
            ...prevData,
            [name]: prevArray.filter((item: string) => item !== value),
          };
        }
      });
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  // Handle file uploads
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;

    if (files && files.length > 0) {
      setFormData(prevData => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: null,
      }));
    }

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (name: string) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate the field
    const field = form.fields.find(f => f.name === name);
    if (field) {
      const fieldValidation = validateFormData(
        { [name]: formData[name] },
        { ...form, fields: [field] }
      );

      if (!fieldValidation.isValid) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: fieldValidation.errors[name] || '',
        }));
      }
    }
  };

  // Form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate the form
    const validation = validateFormData(formData, form);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    form.fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        // Use custom submit handler if provided
        await onSubmit(formatFormDataForSubmission(formData));
      } else {
        // Otherwise, use default form submission
        const response = await submitForm(
          parseInt(form.id),
          formatFormDataForSubmission(formData)
        );

        if (response.status === 'mail_sent') {
          setIsSubmitted(true);
          setFormData(createInitialFormValues(form));
          setErrors({});
          setTouched({});
          toast.success(response.message || successMessage);
          launchConfetti();
          setCenteredToastOpen(true);
        } else {
          toast.error(response.message || errorMessage);
          setErrors(response.invalidFields?.reduce((acc, field) => ({ ...acc, [field.field]: field.message }), {}));
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setFormData(createInitialFormValues(form));
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  };

  // Render form fields based on their type
  const renderField = (field: WPCF7Field) => {
    const { id, name, type, required, placeholder } = field;
    const value = formData[name];
    const error = touched[name] && errors[name];
    const fieldId = `form-field-${id}`;

    const commonProps = {
      id: fieldId,
      name,
      required,
      placeholder: placeholder || '',
      disabled: isSubmitting,
      'aria-invalid': Boolean(error),
      'aria-describedby': error ? `${fieldId}-error` : undefined,
      onBlur: () => handleBlur(name),
    };

    // Field label
    const fieldLabel = field.labels?.[0] || name;

    switch (type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <div className={`mb-4 ${fieldClassName}`}>
            <Label htmlFor={fieldId} className={required ? 'form-required text-foreground' : 'text-foreground'}>
              {fieldLabel}
            </Label>
            <Input
              {...commonProps}
              type={type}
              value={value || ''}
              onChange={handleChange}
              className={error ? 'border-red-500 dark:border-red-400' : ''}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {error && <p className="mt-1 text-sm form-error">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className={`mb-4 ${fieldClassName}`}>
            <Label htmlFor={fieldId} className={required ? 'form-required text-foreground' : 'text-foreground'}>
              {fieldLabel}
            </Label>
            <Textarea
              {...commonProps}
              value={value || ''}
              onChange={handleChange}
              className={error ? 'border-red-500 dark:border-red-400' : ''}
              rows={5}
            />
            {error && <p className="mt-1 text-sm form-error">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div className={`mb-4 ${fieldClassName}`}>
            <Label htmlFor={fieldId} className={required ? 'form-required text-foreground' : 'text-foreground'}>
              {fieldLabel}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(val) => handleSelectChange(name, val)}
              disabled={isSubmitting}
            >
              <SelectTrigger id={fieldId} className={error ? 'border-red-500 dark:border-red-400' : ''}>
                <SelectValue placeholder={placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.values.map((optionValue, index) => (
                  <SelectItem key={optionValue} value={optionValue}>
                    {field.labels?.[index] || optionValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="mt-1 text-sm form-error">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div className={`mb-4 ${fieldClassName}`}>
            <fieldset>
              <legend className={`mb-2 ${required ? 'form-required text-foreground' : 'text-foreground'}`}>
                {fieldLabel}
              </legend>
              <div className="space-y-2">
                {field.values.map((optionValue, index) => {
                  const isChecked = Array.isArray(value) && value.includes(optionValue);
                  return (
                    <div key={optionValue} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${fieldId}-${index}`}
                        name={name}
                        value={optionValue}
                        checked={isChecked}
                        onCheckedChange={() => {
                          // Simulate a change event
                          const event = {
                            target: {
                              name,
                              value: optionValue,
                              type: 'checkbox',
                              checked: !isChecked,
                            },
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleChange(event);
                        }}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`${fieldId}-${index}`} className="cursor-pointer text-foreground">
                        {field.labels?.[index] || optionValue}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            {error && <p className="mt-1 text-sm form-error">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className={`mb-4 ${fieldClassName}`}>
            <fieldset>
              <legend className={`mb-2 ${required ? 'form-required text-foreground' : 'text-foreground'}`}>
                {fieldLabel}
              </legend>
              <RadioGroup
                value={value || ''}
                onValueChange={(val) => handleSelectChange(name, val)}
                disabled={isSubmitting}
              >
                <div className="space-y-2">
                  {field.values.map((optionValue, index) => (
                    <div key={optionValue} className="flex items-center space-x-2">
                      <RadioGroupItem
                        id={`${fieldId}-${index}`}
                        value={optionValue}
                      />
                      <Label htmlFor={`${fieldId}-${index}`} className="cursor-pointer text-foreground">
                        {field.labels?.[index] || optionValue}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </fieldset>
            {error && <p className="mt-1 text-sm form-error">{error}</p>}
          </div>
        );

      case 'file':
        return (
          <div className={`mb-4 ${fieldClassName}`}>
            <Label htmlFor={fieldId} className={required ? 'form-required text-foreground' : 'text-foreground'}>
              {fieldLabel}
            </Label>
            <Input
              {...commonProps}
              type="file"
              onChange={handleFileChange}
              className={`${error ? 'border-red-500 dark:border-red-400' : ''} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90`}
              accept={field.options?.join(',')}
            />
            {value && (
              <p className="mt-2 text-sm text-foreground/70">
                Selected file: {value instanceof File ? value.name : 'No file selected'}
              </p>
            )}
            {error && <p className="mt-1 text-sm form-error">{error}</p>}
          </div>
        );

      default:
        return (
          <div className={`mb-4 ${fieldClassName}`}>
            <Label htmlFor={fieldId} className={required ? 'form-required text-foreground' : 'text-foreground'}>
              {fieldLabel}
            </Label>
            <Input
              {...commonProps}
              type="text"
              value={value || ''}
              onChange={handleChange}
              className={error ? 'border-red-500 dark:border-red-400' : ''}
            />
            {error && <p className="mt-1 text-sm form-error">{error}</p>}
          </div>
        );
    }
  };

  // If form is not available, show a loading state
  if (!form) {
    return (
      <div className="p-4 border rounded animate-pulse bg-gray-50">
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 w-1/4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // If form has been submitted successfully, show a success message
  if (isSubmitted) {
    return (
      <div className="p-6 border rounded panel-border panel-bg text-center dark:bg-green-950/30 dark:border-green-800/50 bg-green-50 border-green-200">
        <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-400">Thank You!</h3>
        <p className="mb-4 text-green-600 dark:text-green-300">{successMessage}</p>
        <Button onClick={handleReset} variant="outline">
          Submit Another Response
        </Button>
      </div>
    );
  }

  // Render the form
  return (
    <>
      <form onSubmit={handleSubmit} className={`space-y-6 form-container rounded-lg p-6 ${className}`} autoComplete="off">
        {/* Form title */}
        {form.title && (
          <h3 className="text-xl font-semibold mb-4 text-foreground">{form.title}</h3>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {form.fields.map(field => renderField(field))}
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-primary-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : submitButtonText}
          </Button>
        </div>
      </form>
      <CenteredToast
        message={successMessage || 'Form submitted successfully'}
        open={centeredToastOpen}
        onClose={() => setCenteredToastOpen(false)}
      />
    </>
  );
}