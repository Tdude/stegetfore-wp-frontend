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

interface TryggveContactFormSectionProps {
  data: TryggveContactFormSection;
  className?: string;
  id?: string;
}

export default function TryggveContactFormSectionComponent({ 
  data, 
  className,
  id
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
      // TODO: Implement actual form submission to WordPress or API
      // For now, simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast.success(data.successMessage || 'Tack! Vi kontaktar dig inom kort.');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({});
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Ett fel uppstod. Försök igen senare.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id={id} className={cn("py-16 md:py-24 bg-white", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-6 text-black">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl text-center mb-12 text-gray-800">
            {data.subtitle}
          </p>

          <div className="bg-gray-50 rounded-lg p-8 md:p-12 shadow-custom border border-gray-200">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-primary">✓</div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  Tack för din anmälan!
                </h3>
                <p className="text-gray-800">
                  {data.successMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {data.fields.map((field, index) => (
                  <div key={index}>
                    <Label 
                      htmlFor={field.name}
                      className="text-black font-medium mb-2 block"
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
                        className="w-full"
                        rows={5}
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
                        className="w-full"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full"
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
