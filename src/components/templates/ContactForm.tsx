// src/components/templates/ContactForm.tsx
import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { submitContactForm } from '@/lib/api';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface ContactFormProps {
  formId: number;
  title?: string;
  subtitle?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

const ContactForm: React.FC<ContactFormProps> = ({
  formId,
  title = "Kontakta oss!",
  subtitle = "Ge oss gärna feedback! Hur kan vi hjälpa dig?",
  contactInfo = {
    phone: "+46 123456789",
    email: "tibbecodes@gmail.com",
    address: "Här å där i Tjockhult",
  }
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Form handling state
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('submitting');

    // Create FormData object
    const formDataObj = new FormData();
    formDataObj.append('your-name', formData.name);
    formDataObj.append('your-email', formData.email);
    formDataObj.append('your-message', formData.message);

    try {
      const response = await submitContactForm(formId, formDataObj);

      if (response.status === 'mail_sent') {
        setStatus('success');
        setDialogMessage('Thank you for your message! We will get back to you soon.');
        setDialogOpen(true);
        // Reset form
        setFormData({ name: '', email: '', message: '' });
      } else if (response.status === 'validation_failed' && response.invalidFields) {
        setStatus('error');

        // Map CF7 validation errors to our form fields
        const fieldMap: Record<string, string> = {
          'your-name': 'name',
          'your-email': 'email',
          'your-message': 'message',
        };

        const newErrors: Record<string, string> = {};
        interface InvalidField {
            field: string;
            message: string;
        }

        response.invalidFields.forEach((item: InvalidField) => {
            const fieldName = fieldMap[item.field] || item.field;
            newErrors[fieldName] = item.message;
        });

        setErrors(newErrors);
      } else {
        setStatus('error');
        setDialogMessage('Något gick fel. Försök igen om en stund.');
        setDialogOpen(true);
      }
    } catch (error) {
      setStatus('error');
      setDialogMessage('Kunde inte skicka iväg. Försök igen om en stund');
      setDialogOpen(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-10 text-center text-3xl font-bold">{title}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-10">
              <label htmlFor="name" className="form-label block text-sm font-medium">
                Namn <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="form-input w-full border-0 border-b-2 border-border bg-transparent px-0 py-2 focus:border-primary focus:ring-transparent"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="mb-10">
              <label htmlFor="email" className="form-label block text-sm font-medium">
                E-post <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full border-0 border-b-2 border-border bg-transparent px-0 py-2 focus:border-primary focus:ring-transparent"
                placeholder="john.doe@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="mb-10">
              <label htmlFor="message" className="form-label block text-sm font-medium">
                Meddelande <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="form-input w-full resize-y border-0 border-b-2 border-border bg-transparent px-0 py-2 focus:border-primary focus:ring-transparent"
                placeholder="Write here your detailed message..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={status === 'submitting'}
              asChild
            >
              {status === 'submitting' ? 'Skickar...' : 'Skicka meddelandet'}
            </Button>
          </form>
        </div>

        {/* Contact Info Column */}
        <div className="lg:col-span-5">
          <h3 className="mb-4 text-xl font-extrabold">
            Om du vill kontakta oss
          </h3>
          <p className="mb-10 text-muted-foreground">{subtitle}</p>

          {/* Phone */}
          {contactInfo.phone && (
            <div className="mb-4 flex items-center">
              <div className="mr-3 rounded bg-primary p-2 text-primary-foreground">
                <Phone className="h-5 w-5" />
              </div>
              <p>{contactInfo.phone}</p>
            </div>
          )}

          {/* Email */}
          {contactInfo.email && (
            <div className="mb-4 flex items-center">
              <div className="mr-3 rounded bg-primary p-2 text-primary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <p>{contactInfo.email}</p>
            </div>
          )}

          {/* Address */}
          {contactInfo.address && (
            <div className="mb-4 flex items-center">
              <div className="mr-3 rounded bg-primary p-2 text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <p>{contactInfo.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Submission Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {status === 'success' ? 'Message Sent' : 'Error'}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Stäng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactForm;
