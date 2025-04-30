// src/components/templates/ContactForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { submitForm } from '@/lib/api/formApi';

interface ContactFormProps {
  formId: number;
}

// Default field names from WPCF7
type FormState = Record<string, string>;

interface FormErrors {
  'your-name'?: string;
  'your-email'?: string;
  'your-message'?: string;
}

// Initial form state
const initialFormState: FormState = {
  'your-name': '',
  'your-email': '',
  'your-message': ''
};

export default function ContactForm({ formId }: ContactFormProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate your-name
    if (!formData['your-name'].trim()) {
      newErrors['your-name'] = 'Namn är obligatoriskt';
      isValid = false;
    }

    // Validate your-email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData['your-email'].trim()) {
      newErrors['your-email'] = 'E-post är obligatoriskt';
      isValid = false;
    } else if (!emailRegex.test(formData['your-email'])) {
      newErrors['your-email'] = 'Ange en giltig e-postadress';
      isValid = false;
    }

    // Validate your-message
    if (!formData['your-message'].trim()) {
      newErrors['your-message'] = 'Meddelande är obligatoriskt';
      isValid = false;
    } else if (formData['your-message'].trim().length < 10) {
      newErrors['your-message'] = 'Meddelandet är för kort (minst 10 tecken)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vänligen åtgärda formuläret');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to backend
      const response = await submitForm(formId, formData);
      if (response.status === 'mail_sent') {
        toast.success(response.message || 'Tack för ditt meddelande!');
        setFormData(initialFormState);
        setIsSubmitted(true);
      } else {
        toast.error(response.message || 'Något gick fel. Försök igen senare.');
        setErrors(prev => ({ ...prev, ...response.invalidFields?.reduce((acc, field) => ({ ...acc, [field.field]: field.message }), {}) }));
      }
    } catch (error) {
      toast.error('Något gick fel. Försök igen senare.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the submitted state if the user starts typing again
  useEffect(() => {
    if (isSubmitted &&
        (formData['your-name'] || formData['your-email'] || formData['your-message'])) {
      setIsSubmitted(false);
    }
  }, [formData, isSubmitted]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Name field */}
      <div>
        <Label htmlFor="your-name">Namn</Label>
        <Input
          id="your-name"
          name="your-name"
          value={formData['your-name']}
          onChange={handleChange}
          required
          className={errors['your-name'] ? 'border-red-500' : ''}
        />
        {errors['your-name'] && <p className="text-sm text-red-500 mt-1">{errors['your-name']}</p>}
      </div>

      {/* Email field */}
      <div>
        <Label htmlFor="your-email">E-post</Label>
        <Input
          id="your-email"
          name="your-email"
          type="email"
          value={formData['your-email']}
          onChange={handleChange}
          required
          className={errors['your-email'] ? 'border-red-500' : ''}
        />
        {errors['your-email'] && <p className="text-sm text-red-500 mt-1">{errors['your-email']}</p>}
      </div>

      {/* Message field */}
      <div>
        <Label htmlFor="your-message">Meddelande</Label>
        <Textarea
          id="your-message"
          name="your-message"
          value={formData['your-message']}
          onChange={handleChange}
          required
          className={errors['your-message'] ? 'border-red-500' : ''}
        />
        {errors['your-message'] && <p className="text-sm text-red-500 mt-1">{errors['your-message']}</p>}
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? 'Skickar...' : 'Skicka'}
        </Button>
      </div>
    </form>
  );
}