'use client';

import React, { useState, useEffect } from 'react';
import { fetchContactForm, submitContactFormSimple } from '@/lib/api';
import { WPCF7Form } from '@/lib/types-wordpress';
import confetti from 'canvas-confetti';

interface ContactFormProps {
  formId: string;
}

export default function ContactForm({ formId }: ContactFormProps) {
  const [form, setForm] = useState<WPCF7Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<{
    status: string;
    message: string;
  } | null>(null);

  // Fetch form data on component mount
  useEffect(() => {
    const getForm = async () => {
      try {
        setLoading(true);
        const formData = await fetchContactForm(formId);
        setForm(formData);

        // Initialize form values with empty strings
        const initialValues: Record<string, string> = {};
        formData.fields.forEach(field => {
          initialValues[field.name] = '';
        });
        setFormValues(initialValues);
      } catch (error) {
        console.error('Error fetching form:', error);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      getForm();
    }
  }, [formId]);

  // Effect to trigger confetti when form is successfully submitted.
  // Read more: https://www.kirilv.com/canvas-confetti/
  useEffect(() => {
    if (submitResult?.status === 'mail_sent') {


      var defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
      };

      function shoot() {
        confetti({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          shapes: ['star']
        });

        confetti({
          ...defaults,
          particleCount: 10,
          scalar: 0.75,
          shapes: ['circle']
        });
      }

      setTimeout(shoot, 0);
      setTimeout(shoot, 250);
      setTimeout(shoot, 800);

    }
  }, [submitResult]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };



// Handle form submission
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Reset states
  setErrors({});
  setSubmitResult(null);
  setSubmitting(true);

  try {
    // Use the simple endpoint instead
    const response = await submitContactFormSimple(formId, formValues);

    // Handle validation errors
    if (response.status === 'validation_failed' && response.invalidFields) {
      const newErrors: Record<string, string> = {};
      response.invalidFields.forEach(field => {
        newErrors[field.field] = field.message;
      });
      setErrors(newErrors);
    } else {
      // Show success or other message
      setSubmitResult({
        status: response.status,
        message: response.message
      });

      // Reset form values on success
      if (response.status === 'mail_sent') {
        const initialValues: Record<string, string> = {};
        form?.fields.forEach(field => {
          initialValues[field.name] = '';
        });
        setFormValues(initialValues);
      }
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    setSubmitResult({
      status: 'error',
      message: 'Ett fel uppstod. Vänligen försök igen senare.'
    });
  } finally {
    setSubmitting(false);
  }
};

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  // Show error if form not loaded
  if (!form) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Kunde inte ladda formuläret. Vänligen försök igen senare.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">{form.title}</h2>

      {/* Success/Error Message */}
      {submitResult && (
        <div
          className={`mb-6 px-4 py-3 rounded ${
            submitResult.status === 'mail_sent'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <p>{submitResult.message}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700"
            >
              {field.labels[0] || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Render different inputs based on field type */}
            {field.basetype === 'text' && (
              <input
                type="text"
                id={field.id}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            )}

            {field.basetype === 'email' && (
              <input
                type="email"
                id={field.id}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            )}

            {field.basetype === 'tel' && (
              <input
                type="tel"
                id={field.id}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            )}

            {field.basetype === 'url' && (
              <input
                type="url"
                id={field.id}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            )}

            {field.basetype === 'textarea' && (
              <textarea
                id={field.id}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                required={field.required}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            )}

            {field.basetype === 'select' && (
              <select
                id={field.id}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Välj...</option>
                {field.values.map((value, index) => (
                  <option key={index} value={value}>
                    {field.labels[index+1] || value}
                  </option>
                ))}
              </select>
            )}

            {/* Checkbox - special handling */}
            {field.basetype === 'checkbox' && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id={field.id}
                    name={field.name}
                    checked={!!formValues[field.name]}
                    onChange={(e) => handleChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: field.name,
                        value: e.target.checked ? 'on' : ''
                      }
                    } as any)}
                    required={field.required}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={field.id} className="font-medium text-gray-700">
                    {field.labels[0] || field.name}
                  </label>
                </div>
              </div>
            )}

            {/* Radio buttons */}
            {field.basetype === 'radio' && (
              <div className="space-y-2">
                {field.values.map((value, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`${field.id}-${index}`}
                      name={field.name}
                      value={value}
                      checked={formValues[field.name] === value}
                      onChange={handleChange}
                      required={field.required}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-yellow-500"
                    />
                    <label
                      htmlFor={`${field.id}-${index}`}
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      {field.labels[index+1] || value}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Error message */}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 bg-yellow-500 text-white rounded shadow-sm font-medium
              ${submitting
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
              }`}
          >
            {submitting ? 'Skickar...' : 'Skicka'}
          </button>
        </div>
      </form>
    </div>
  );
}