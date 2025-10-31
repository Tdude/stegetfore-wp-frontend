// src/components/tryggve/TryggveContactFormSection.tsx
'use client';

import React, { useState } from 'react';
import { TryggveContactFormSection } from '@/lib/types/tryggveLandingTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { submitForm } from '@/lib/api/formApi';

interface TryggveContactFormSectionProps {
  data: TryggveContactFormSection;
  className?: string;
  id?: string;
  formId?: number; // Contact Form 7 ID
}

export default function TryggveContactFormSectionComponent({ 
  data, 
  className,
  id,
  formId = 1 // Default to CF7 form ID 1, can be overridden
}: TryggveContactFormSectionProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to Contact Form 7 via WordPress API
      const response = await submitForm(formId, formData);
      
      if (response.status === 'mail_sent') {
        setIsSubmitted(true);
        toast.success(data.successMessage || response.message || 'Tack! Vi kontaktar dig inom kort.');
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormData({});
          setIsSubmitted(false);
        }, 5000);
      } else {
        toast.error(response.message || 'Ett fel uppstod. Försök igen senare.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Ett fel uppstod. Försök igen senare.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id={id} className={cn("py-16 md:py-24 bg-white", className)}>
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-center mb-6 text-black px-4">
            {data.title}
          </h2>
          <p className="text-xl md:text-2xl text-center mb-12 text-gray-800 px-4">
            {data.subtitle}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 md:p-10 lg:p-12 shadow-custom border border-gray-200">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-primary">✓</div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  Tack för din anmälan!
                </h3>
                <p className="text-lg text-gray-800">
                  {data.successMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {data.fields.map((field, index) => (
                  <div key={index}>
                    <Label 
                      htmlFor={field.name}
                      className="text-black text-lg md:text-xl font-medium mb-3 block"
                    >
                      {field.label}
                      {field.required && <span className="text-red-600 ml-1">*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        className="w-full text-lg md:text-xl p-4"
                        rows={6}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        className="w-full text-lg md:text-xl p-4 h-14"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg md:text-xl py-5 px-8 rounded-lg transition-colors h-16"
                  >
                    {isSubmitting ? 'Skickar...' : data.submitButtonText}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
