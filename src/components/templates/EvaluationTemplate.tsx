// components/EvaluationTemplate.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';

// Assuming wpApiSettings is available globally, declare it here
declare const wpApiSettings: {
  nonce: string;
};
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { FormData, initialFormState, ProgressBarProps, SubSectionProps } from '@/lib/types';

// Styling classes
const stageClasses = {
  ej: 'border-l-4 border-red-200 pl-4',
  trans: 'border-l-4 border-amber-200 pl-4',
  full: 'border-l-4 border-green-200 pl-4'
};

// Progress Bar component
const ProgressBar: React.FC<ProgressBarProps> = ({ value, type, stage }) => {
  const baseClasses = "h2 rounded-full transition-all duration-300";
  const typeClasses = type === 'section' ? 'h-1' : 'h-6';

  const getProgressColor = (value: number, stage?: 'ej' | 'trans' | 'full') => {
    if (type === 'total' && stage === 'ej') return 'bg-red-500';
    if (value < 33) return 'bg-red-500';
    if (value < 66) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full">
      <div
        className={`${baseClasses} ${typeClasses} ${getProgressColor(value, stage)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

// SubSection component
const SubSection: React.FC<SubSectionProps> = ({
  title,
  name,
  options,
  value,
  onChange,
  onCommentChange,
  comment,
  sectionKey,
  fieldName,
  calculateProgress
}) => {
  const progress = calculateProgress(sectionKey, fieldName);

  // Group options by stage
  const groupedOptions = options.reduce((acc, opt) => {
    if (!acc[opt.stage]) acc[opt.stage] = [];
    acc[opt.stage].push(opt);
    return acc;
  }, {} as Record<string, typeof options>);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ProgressBar value={progress} type="section" />

      <RadioGroup value={value} onValueChange={onChange} className="mt-4">
        {Object.entries(groupedOptions).map(([stage, stageOptions]) => (
          <div key={stage} className={stageClasses[stage as keyof typeof stageClasses]}>
            {stageOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <Label
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm cursor-pointer hover:bg-gray-50 rounded p-2 flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        ))}
      </RadioGroup>

      <Textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder={`Kommentar om ${title.toLowerCase()}...`}
        className="mt-4"
      />
    </div>
  );
};

// Progress Header Component
interface ProgressHeaderProps {
  stages: Array<{
    label: string;
    type: 'ej' | 'trans' | 'full';
  }>;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ stages }) => {
  const headerStageClasses = {
    ej: 'border-b-4 border-red-200',
    trans: 'border-b-4 border-amber-200',
    full: 'border-b-4 border-green-200'
  };

  return (
    <div className="flex justify-between mb-2">
      {stages.map((stage) => (
        <div
          key={stage.type}
          className={`flex-1 text-center p-2 text-lg font-bold ${headerStageClasses[stage.type]}`}
        >
          {stage.label}
        </div>
      ))}
    </div>
  );
};

// Options definitions
const narvaroOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Kommer inte till skolan', stage: 'ej' },
  { value: '2', label: 'Kommer till skolan, ej till lektion', stage: 'ej' },
  { value: '3', label: 'Kommer till min lektion ibland', stage: 'trans' },
  { value: '4', label: 'Kommer alltid till min lektion', stage: 'trans' },
  { value: '5', label: 'Kommer till andras lektioner', stage: 'full' }
];

const dialog1Options: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Helt tyst', stage: 'ej' },
  { value: '2', label: 'Säger enstaka ord till mig', stage: 'ej' },
  { value: '3', label: 'Vi pratar ibland', stage: 'trans' },
  { value: '4', label: 'Har full dialog med mig', stage: 'trans' },
  { value: '5', label: 'Har dialog med andra vuxna', stage: 'full' }
];

const dialog2Options: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Pratar oavbrutet', stage: 'ej' },
  { value: '2', label: 'Är tyst vid tillsägelse', stage: 'ej' },
  { value: '3', label: 'Lyssnar på mig', stage: 'trans' },
  { value: '4', label: 'Har full dialog med mig', stage: 'trans' },
  { value: '5', label: 'Dialog med vissa andra vuxna', stage: 'full' }
];

const blickOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Möter inte min blick', stage: 'ej' },
  { value: '2', label: 'Har gett mig ett ögonkast', stage: 'ej' },
  { value: '3', label: 'Håller fast ögonkontakt', stage: 'trans' },
  { value: '4', label: '"Pratar" med ögonen', stage: 'trans' },
  { value: '5', label: 'Möter andras blickar', stage: 'full' }
];

const beroringOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Jag får inte närma mig', stage: 'ej' },
  { value: '2', label: 'Jag får närma mig', stage: 'ej' },
  { value: '3', label: 'Tillåter beröring av mig', stage: 'trans' },
  { value: '4', label: 'Söker fysisk kontakt, ex. kramar', stage: 'trans' },
  { value: '5', label: 'Tillåter beröring av andra vuxna', stage: 'full' }
];

const konfliktOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Försvinner från skolan vid konflikt', stage: 'ej' },
  { value: '2', label: 'Stannar kvar på skolan', stage: 'ej' },
  { value: '3', label: 'Kommer tillbaka till mig', stage: 'trans' },
  { value: '4', label: 'Förklarar för mig efter konflikt', stage: 'trans' },
  { value: '5', label: 'Kommer tillbaka till andra vuxna', stage: 'full' }
];

const fortroendeOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Delar inte med sig', stage: 'ej' },
  { value: '2', label: 'Delar med sig till mig ibland', stage: 'ej' },
  { value: '3', label: 'Vill dela med sig till mig', stage: 'trans' },
  { value: '4', label: 'Ger mig förtroenden', stage: 'trans' },
  { value: '5', label: 'Ger även förtroenden till vissa andra', stage: 'full' }
];

const impulskontrollOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Helt impulsstyrd', stage: 'ej' },
  { value: '2', label: 'Kan ibland hålla negativa känslor', stage: 'ej' },
  { value: '3', label: 'Skäms över negativa beteenden', stage: 'trans' },
  { value: '4', label: 'Kan ta mot tillsägelse', stage: 'trans' },
  { value: '5', label: 'Kan prata om det som hänt', stage: 'full' }
];

const forberedddOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Aldrig', stage: 'ej' },
  { value: '2', label: 'Lyckas vara förberedd en första gång', stage: 'ej' },
  { value: '3', label: 'Försöker vara förberedd som andra', stage: 'trans' },
  { value: '4', label: 'Pratar om förberedelse', stage: 'trans' },
  { value: '5', label: 'Planerar och har ordning', stage: 'full' }
];

const fokusOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Kan inte koncentrera sig', stage: 'ej' },
  { value: '2', label: 'Kan fokusera en kort stund vid enskild tillsägelse', stage: 'ej' },
  { value: '3', label: 'Kan fokusera självmant tillsammans med andra', stage: 'trans' },
  { value: '4', label: 'Pratar om fokus och förbättrar sig', stage: 'trans' },
  { value: '5', label: 'Kan fokusera och koncentrera sig', stage: 'full' }
];

const turtagningOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Klarar ej', stage: 'ej' },
  { value: '2', label: 'Klarar av att vänta vid tillsägelse', stage: 'ej' },
  { value: '3', label: 'Gör som andra, räcker upp handen', stage: 'trans' },
  { value: '4', label: 'Kan komma överens om hur turtagning fungerar', stage: 'trans' },
  { value: '5', label: 'Full turtagning', stage: 'full' }
];

const instruktionOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Tar inte/förstår inte instruktion', stage: 'ej' },
  { value: '2', label: 'Tar/förstår instruktion i ett led men startar inte en uppgift', stage: 'ej' },
  { value: '3', label: 'Tar/förstår instruktion i flera led, kan lösa uppgift ibland', stage: 'trans' },
  { value: '4', label: 'Kan prata om uppgiftslösning', stage: 'trans' },
  { value: '5', label: 'Genomför uppgifter', stage: 'full' }
];

const arbetaSjalvOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Klarar inte', stage: 'ej' },
  { value: '2', label: 'Löser en uppgift med stöd', stage: 'ej' },
  { value: '3', label: 'Kan klara uppgifter självständigt i klassrummet', stage: 'trans' },
  { value: '4', label: 'Gör ofta läxor och pratar om dem', stage: 'trans' },
  { value: '5', label: 'Tar ansvar för självständigt arbete utanför skolan', stage: 'full' }
];

const tidOptions: { value: string; label: string; stage: 'ej' | 'trans' | 'full' }[] = [
  { value: '1', label: 'Ingen tidsuppfattning', stage: 'ej' },
  { value: '2', label: 'Börjar använda andra konkreta referenser', stage: 'ej' },
  { value: '3', label: 'Har begrepp för en kvart', stage: 'trans' },
  { value: '4', label: 'Kan beskriva tidslängd och ordningsförlopp', stage: 'trans' },
  { value: '5', label: 'God tidsuppfattning', stage: 'full' }
];

interface StudentEvaluationFormProps {
  evaluationId?: number;
}

const StudentEvaluationForm: React.FC<StudentEvaluationFormProps> = ({ evaluationId }) => {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  // For data loading
  useEffect(() => {
    if (!evaluationId) return;

    const fetchData = async () => {
      toast.loading('Hämtar utvärdering...', {
        id: 'loading-data', // Unique ID to reference this toast
      });

      try {
        const response = await fetch(`/wp-json/evaluation/v1/get/${evaluationId}`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setFormData(data.formData);

        toast.success('Utvärdering laddad', {
          id: 'loading-data', // Replace the loading toast
        });
      } catch (error) {
        console.error('Error:' + error);
        toast.error('Kunde inte hämta utvärderingen', {
          id: 'loading-data', // Replace the loading toast
        });
      }
    };

    fetchData();
  }, [evaluationId]);

  // For form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Show loading toast that we can dismiss later
    const loadingToast = toast.loading('Sparar utvärdering...');

    try {
      const response = await fetch('/wp-json/evaluation/v1/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          student_name: "Student Name",
          formData: formData
        })
      });

      if (!response.ok) throw new Error('Failed to save evaluation');

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Utvärderingen sparades!', {
        duration: 3000, // Will dismiss after 3 seconds
      });

    } catch (error) {
      console.error('Error: ' + error);
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Kunde inte spara utvärderingen', {
        description: 'Försök igen eller kontakta support',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form value changes
  const handleValueChange = (section: keyof FormData, field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle comment changes
  const handleCommentChange = (section: keyof FormData, field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        comments: {
          ...prev[section].comments,
          [field]: value
        }
      }
    }));
  };

  // Progress calculations
  const calculateSectionProgress = useCallback((section: keyof FormData, field: string): number => {
    if (!formData?.[section]?.[field as keyof typeof formData[typeof section]]) return 0;
    const value = formData[section][field as keyof typeof formData[typeof section]];
    return typeof value === 'string' && value ? (parseInt(value) / 5) * 100 : 0;
  }, [formData]);

  const calculateTotalProgress = useCallback((section: keyof FormData): number => {
    if (!formData?.[section]) return 0;

    const sectionData = formData[section];
    const fields = Object.keys(sectionData).filter(key => key !== 'comments');

    const totalValue = fields.reduce((sum, field) => {
      const value = sectionData[field as keyof typeof sectionData];
      return sum + (typeof value === 'string' && value ? parseInt(value) : 0);
    }, 0);

    const maxValue = fields.length * 5;
    return (totalValue / maxValue) * 100;
  }, [formData]);

  // Stage helpers
  const getTotalStage = (progress: number): 'ej' | 'trans' | 'full' => {
    if (progress < 33) return 'ej';
    if (progress < 66) return 'trans';
    return 'full';
  };

  // Group criteria for better layout
  const anknytningGroup1 = [
    { title: 'Närvaro', name: 'narvaro', options: narvaroOptions },
    { title: 'Dialog 1', name: 'dialog1', options: dialog1Options },
    { title: 'Dialog 2', name: 'dialog2', options: dialog2Options },
  ];

  const anknytningGroup2 = [
    { title: 'Blick, kroppsspråk', name: 'blick', options: blickOptions },
    { title: 'Beröring', name: 'beroring', options: beroringOptions },
    { title: 'Vid konflikt', name: 'konflikt', options: konfliktOptions },
    { title: 'Förtroende', name: 'fortroende', options: fortroendeOptions },
  ];

  const ansvarGroup1 = [
    { title: 'Impulskontroll', name: 'impulskontroll', options: impulskontrollOptions },
    { title: 'Förberedd', name: 'forberedd', options: forberedddOptions },
    { title: 'Fokus', name: 'fokus', options: fokusOptions },
  ];

  const ansvarGroup2 = [
    { title: 'Turtagning', name: 'turtagning', options: turtagningOptions },
    { title: 'Instruktion', name: 'instruktion', options: instruktionOptions },
    { title: 'Arbeta själv', name: 'arbeta_sjalv', options: arbetaSjalvOptions },
    { title: 'Tid', name: 'tid', options: tidOptions },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Anknytningstecken</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Two column layout for bigger screens */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* First column */}
            <div className="md:w-1/2">
              {anknytningGroup1.map((item) => (
                <SubSection
                  key={item.name}
                  title={item.title}
                  name={item.name}
                  options={item.options}
                  value={String(formData?.anknytning?.[item.name as keyof typeof formData.anknytning] || '')}
                  onChange={handleValueChange('anknytning', item.name)}
                  onCommentChange={handleCommentChange('anknytning', item.name)}
                  comment={formData?.anknytning?.comments?.[item.name] ?? ''}
                  sectionKey="anknytning"
                  fieldName={item.name}
                  calculateProgress={calculateSectionProgress}
                />
              ))}
            </div>

            {/* Second column */}
            <div className="md:w-1/2">
              {anknytningGroup2.map((item) => (
                <SubSection
                  key={item.name}
                  title={item.title}
                  name={item.name}
                  options={item.options}
                  value={String(formData?.anknytning?.[item.name as keyof typeof formData.anknytning] || '')}
                  onChange={handleValueChange('anknytning', item.name)}
                  onCommentChange={handleCommentChange('anknytning', item.name)}
                  comment={formData?.anknytning?.comments?.[item.name] ?? ''}
                  sectionKey="anknytning"
                  fieldName={item.name}
                  calculateProgress={calculateSectionProgress}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <ProgressHeader
              stages={[
                { label: 'Ej anknuten', type: 'ej' },
                { label: 'Tecken på anknytning till mig', type: 'trans' },
                { label: 'Anknytning spiller över', type: 'full' }
              ]}
            />
            <ProgressBar
              value={calculateTotalProgress('anknytning')}
              type="total"
              stage={getTotalStage(calculateTotalProgress('anknytning'))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ansvarstecken</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Two column layout for bigger screens */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* First column */}
            <div className="md:w-1/2">
              {ansvarGroup1.map((item) => (
                <SubSection
                  key={item.name}
                  title={item.title}
                  name={item.name}
                  options={item.options}
                  value={String(formData?.ansvar?.[item.name as keyof typeof formData.ansvar] || '')}
                  onChange={handleValueChange('ansvar', item.name)}
                  onCommentChange={handleCommentChange('ansvar', item.name)}
                  comment={formData?.ansvar?.comments?.[item.name] ?? ''}
                  sectionKey="ansvar"
                  fieldName={item.name}
                  calculateProgress={calculateSectionProgress}
                />
              ))}
            </div>

            {/* Second column */}
            <div className="md:w-1/2">
              {ansvarGroup2.map((item) => (
                <SubSection
                  key={item.name}
                  title={item.title}
                  name={item.name}
                  options={item.options}
                  value={String(formData?.ansvar?.[item.name as keyof typeof formData.ansvar] || '')}
                  onChange={handleValueChange('ansvar', item.name)}
                  onCommentChange={handleCommentChange('ansvar', item.name)}
                  comment={formData?.ansvar?.comments?.[item.name] ?? ''}
                  sectionKey="ansvar"
                  fieldName={item.name}
                  calculateProgress={calculateSectionProgress}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <ProgressHeader
              stages={[
                { label: 'Ej elev', type: 'ej' },
                //{ label: 'Under utveckling', type: 'trans' },
                { label: 'Elev', type: 'full' }
              ]}
            />
            <ProgressBar
              value={calculateTotalProgress('ansvar')}
              type="total"
              stage={getTotalStage(calculateTotalProgress('ansvar'))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          type="submit"
          className="px-8 py-2 text-lg"
          disabled={isSaving}
        >
          {isSaving ? 'Sparar...' : 'Spara utvärdering'}
        </Button>
      </div>
    </form>
  );
};

export default StudentEvaluationForm;