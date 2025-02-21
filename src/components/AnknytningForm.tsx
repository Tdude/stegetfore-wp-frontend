// conponents/AnknytningForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const AssessmentForm = () => {
  const initialFormState = {
    impuls: '',
    planering: '',
    koncentration: '',
    instruktioner: '',
    tid: '',
    turtagning: '',
    narvaro: '',
    kommunikation: '',
    blickkontakt: '',
    fysiskkontakt: '',
    konflikt: '',
    comments: {
      impuls: '',
      planering: '',
      koncentration: '',
      instruktioner: '',
      tid: '',
      turtagning: '',
      narvaro: '',
      kommunikation: '',
      blickkontakt: '',
      fysiskkontakt: '',
      konflikt: ''
    }
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleRadioChange = (section, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const handleCommentChange = (section, value) => {
    setFormData(prev => ({
      ...prev,
      comments: {
        ...prev.comments,
        [section]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your WordPress backend
    alert('Formuläret skickades in!');
  };

  const sections = [
    {
      id: 'impuls',
      title: 'Impulskontroll',
      options: [
        { value: '1', label: 'Helt impulsstyrd (ex. svårt att sitta still, pratar rakt ut, "förstör")' },
        { value: '2', label: 'Kan ibland hålla negativa känslor utan att agera på dem' },
        { value: '3', label: 'Kan prata om svårigheter med impulshandlingar' }
      ]
    },
    {
      id: 'planering',
      title: 'Planering',
      options: [
        { value: '1', label: 'Aldrig förberedd, glömmer, vet inte vad som ska med' },
        { value: '2', label: 'Lyckas vara förberedd ibland' },
        { value: '3', label: 'Är ofta förberedd' },
        { value: '4', label: 'Planerar och har ordning för det mesta' }
      ]
    },
    // Add all other sections here...
  ];

  const renderSection = (section) => (
    <Card key={section.id} className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-600">{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={formData[section.id]}
          onValueChange={(value) => handleRadioChange(section.id, value)}
          className="space-y-2"
        >
          {section.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${section.id}-${option.value}`} />
              <Label htmlFor={`${section.id}-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Textarea
          placeholder="Kommentar..."
          className="mt-4"
          value={formData.comments[section.id]}
          onChange={(e) => handleCommentChange(section.id, e.target.value)}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Strukturerad lista för webbaserat verktyg
        </h1>

        {sections.map(renderSection)}

        <Button
          type="submit"
          className="w-full md:w-auto"
        >
          Skicka in
        </Button>
      </form>
    </div>
  );
};

export default AssessmentForm;