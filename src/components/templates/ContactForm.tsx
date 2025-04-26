// src/components/templates/ContactForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

// Initial form state
const initialFormState: FormState = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

export default function (ContactForm) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Namn är obligatoriskt';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'E-post är obligatoriskt';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ange en giltig e-postadress';
      isValid = false;
    }

    // Validate subject
    if (!formData.subject.trim()) {
      newErrors.subject = 'Ämne är obligatoriskt';
      isValid = false;
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Meddelande är obligatoriskt';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Meddelandet är för kort (minst 10 tecken)';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      toast.success('Tack för ditt meddelande!');
      setFormData(initialFormState);
      setIsSubmitted(true);
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
        (formData.name || formData.email || formData.subject || formData.message)) {
      setIsSubmitted(false);
    }
  }, [formData, isSubmitted]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Name field */}
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Email field */}
      <div>
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
      </div>

      {/* Subject field */}
      <div>
        <Label htmlFor="subject">Ämne</Label>
        <Input
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className={errors.subject ? 'border-red-500' : ''}
        />
        {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
      </div>

      {/* Message field */}
      <div>
        <Label htmlFor="message">Meddelande</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message}</p>}
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