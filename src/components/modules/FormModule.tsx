// src/components/modules/FormModule.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FormModule as FormModuleType } from '@/lib/types';
import { fetchFormStructure, submitForm } from '@/lib/api';
import DynamicForm from '@/components/forms/DynamicForm';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface FormModuleProps {
  module: FormModuleType;
  className?: string;
}

export default function FormModule({ module, className }: FormModuleProps) {
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadForm = async () => {
      try {
        setIsLoading(true);
        const formData = await fetchFormStructure(module.form_id);
        setForm(formData);
      } catch (err) {
        console.error('Error loading form:', err);
        setError('Unable to load the form. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [module.form_id]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      const response = await submitForm(module.form_id, formData);

      // Check if redirect URL is set
      if (response.status === 'mail_sent' && module.redirect_url) {
        window.location.href = module.redirect_url;
      }

      return response;
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className={cn("py-12", className)}>
        <div className="container px-4 md:px-6 mx-auto">
          <Card className="max-w-2xl mx-auto p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 ml-auto"></div>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={cn("py-12", className)}>
        <div className="container px-4 md:px-6 mx-auto">
          <Card className="max-w-2xl mx-auto p-6 border-red-200 bg-red-50">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Form Error</h3>
              <p>{error}</p>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-2xl mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold text-center mb-6">{module.title}</h2>
          )}

          {module.description && (
            <p className="text-center text-muted-foreground mb-8">{module.description}</p>
          )}

          <Card className="p-6">
            {form ? (
              <DynamicForm
                form={form}
                onSubmit={handleSubmit}
                successMessage={module.success_message || 'Your message has been sent successfully.'}
                errorMessage={module.error_message || 'There was an error submitting the form. Please try again.'}
              />
            ) : (
              <p className="text-center text-muted-foreground">Form could not be loaded</p>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}