// components/EvaluationTemplate.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

import TemplateTransitionWrapper from './TemplateTransitionWrapper';

// Types
interface SaveResponse {
  success: boolean;
  id: number;
  message: string;
}

interface LoadedData {
  id: number;
  formData: FormData;
  last_updated: string;
}

interface FormData {
  anknytning: {
    narvaro: string;
    dialog1: string;
    dialog2: string;
    blick: string;
    beroring: string;
    konflikt: string;
    fortroende: string;
    comments: Record<string, string>;
  };
  ansvar: {
    impulskontroll: string;
    forberedd: string;
    fokus: string;
    turtagning: string;
    instruktion: string;
    arbeta_sjalv: string;
    tid: string;
    comments: Record<string, string>;
  };
}

interface SubSectionProps {
  title: string;
  name: string;
  options: Array<{
    value: string;
    label: string;
    stage: 'ej' | 'trans' | 'full';
  }>;
  value: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  comment: string;
  sectionKey: keyof FormData;
  fieldName: string;
  calculateProgress: (section: keyof FormData, field: string) => number;
}


interface ProgressBarProps {
  value: number;
  type: 'section' | 'total';
  stage?: 'ej' | 'trans' | 'full';
}

// Initial form state
const initialFormState: FormData = {
  anknytning: {
    narvaro: '',
    dialog1: '',
    dialog2: '',
    blick: '',
    beroring: '',
    konflikt: '',
    fortroende: '',
    comments: {}
  },
  ansvar: {
    impulskontroll: '',
    forberedd: '',
    fokus: '',
    turtagning: '',
    instruktion: '',
    arbeta_sjalv: '',
    tid: '',
    comments: {}
  }
};

// Styling classes
const stageClasses = {
  ej: 'border-l-4 border-red-200 pl-4',
  trans: 'border-l-4 border-amber-200 pl-4',
  full: 'border-l-4 border-green-200 pl-4'
};

// Progress Bar component
const ProgressBar: React.FC<ProgressBarProps> = ({ value, type, stage }) => {
  const baseClasses = "h-2 rounded-full transition-all duration-300";
  const typeClasses = type === 'section' ? 'h-1' : 'h-2';

  const getProgressColor = (value: number, stage?: string) => {
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


  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ProgressBar value={progress} type="section" />

      <RadioGroup value={value} onValueChange={onChange} className="mt-4">
        {Object.entries(options.reduce((acc, opt) => {
          if (!acc[opt.stage]) acc[opt.stage] = [];
          acc[opt.stage].push(opt);
          return acc;
        }, {} as Record<string, typeof options>)).map(([stage, stageOptions]) => (
          <div key={stage} className={stageClasses[stage as keyof typeof stageClasses]}>
            {stageOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2 py-1">
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

const narvaroOptions = [
  { value: '1', label: 'Kommer inte till skolan', stage: 'ej' },
  { value: '2', label: 'Kommer till skolan, ej till lektion', stage: 'ej' },
  { value: '3', label: 'Kommer till min lektion ibland', stage: 'trans' },
  { value: '4', label: 'Kommer alltid till min lektion', stage: 'trans' },
  { value: '5', label: 'Kommer till andras lektioner', stage: 'full' }
] as const;


// Add these option arrays after the existing narvaroOptions
const dialog1Options = [
  { value: '1', label: 'Helt tyst', stage: 'ej' },
  { value: '2', label: 'Säger enstaka ord till mig', stage: 'ej' },
  { value: '3', label: 'Vi pratar ibland', stage: 'trans' },
  { value: '4', label: 'Har full dialog med mig', stage: 'trans' },
  { value: '5', label: 'Har dialog med andra vuxna', stage: 'full' }
] as const;

const dialog2Options = [
  { value: '1', label: 'Pratar oavbrutet', stage: 'ej' },
  { value: '2', label: 'Är tyst vid tillsägelse', stage: 'ej' },
  { value: '3', label: 'Lyssnar på mig', stage: 'trans' },
  { value: '4', label: 'Har full dialog med mig', stage: 'trans' },
  { value: '5', label: 'Dialog med vissa andra vuxna', stage: 'full' }
] as const;

const blickOptions = [
  { value: '1', label: 'Möter inte min blick', stage: 'ej' },
  { value: '2', label: 'Har gett mig ett ögonkast', stage: 'ej' },
  { value: '3', label: 'Håller fast ögonkontakt', stage: 'trans' },
  { value: '4', label: '"Pratar" med ögonen', stage: 'trans' },
  { value: '5', label: 'Möter andras blickar', stage: 'full' }
] as const;

const beroringOptions = [
  { value: '1', label: 'Jag får inte närma mig', stage: 'ej' },
  { value: '2', label: 'Jag får närma mig', stage: 'ej' },
  { value: '3', label: 'Tillåter beröring av mig', stage: 'trans' },
  { value: '4', label: 'Söker fysisk kontakt, ex. kramar', stage: 'trans' },
  { value: '5', label: 'Tillåter beröring av andra vuxna', stage: 'full' }
] as const;

const konfliktOptions = [
  { value: '1', label: 'Försvinner från skolan vid konflikt', stage: 'ej' },
  { value: '2', label: 'Stannar kvar på skolan', stage: 'ej' },
  { value: '3', label: 'Kommer tillbaka till mig', stage: 'trans' },
  { value: '4', label: 'Förklarar för mig efter konflikt', stage: 'trans' },
  { value: '5', label: 'Kommer tillbaka till andra vuxna', stage: 'full' }
] as const;

const fortroendeOptions = [
  { value: '1', label: 'Delar inte med sig', stage: 'ej' },
  { value: '2', label: 'Delar med sig till mig ibland', stage: 'ej' },
  { value: '3', label: 'Vill dela med sig till mig', stage: 'trans' },
  { value: '4', label: 'Ger mig förtroenden', stage: 'trans' },
  { value: '5', label: 'Ger även förtroenden till vissa andra', stage: 'full' }
] as const;


const impulskontrollOptions = [
  { value: '1', label: 'Helt impulsstyrd', stage: 'ej' },
  { value: '2', label: 'Kan ibland hålla negativa känslor', stage: 'ej' },
  { value: '3', label: 'Skäms över negativa beteenden', stage: 'trans' },
  { value: '4', label: 'Kan ta mot tillsägelse', stage: 'trans' },
  { value: '5', label: 'Kan prata om det som hänt', stage: 'full' }
] as const;

const forberedddOptions = [
  { value: '1', label: 'Aldrig', stage: 'ej' },
  { value: '2', label: 'Lyckas vara förberedd en första gång', stage: 'ej' },
  { value: '3', label: 'Försöker vara förberedd som andra', stage: 'trans' },
  { value: '4', label: 'Pratar om förberedelse', stage: 'trans' },
  { value: '5', label: 'Planerar och har ordning', stage: 'full' }
] as const;

const fokusOptions = [
  { value: '1', label: 'Kan inte koncentrera sig', stage: 'ej' },
  { value: '2', label: 'Kan fokusera en kort stund vid enskild tillsägelse', stage: 'ej' },
  { value: '3', label: 'Kan fokusera självmant tillsammans med andra', stage: 'trans' },
  { value: '4', label: 'Pratar om fokus och förbättrar sig', stage: 'trans' },
  { value: '5', label: 'Kan fokusera och koncentrera sig', stage: 'full' }
] as const;

const turtagningOptions = [
  { value: '1', label: 'Klarar ej', stage: 'ej' },
  { value: '2', label: 'Klarar av att vänta vid tillsägelse', stage: 'ej' },
  { value: '3', label: 'Gör som andra, räcker upp handen', stage: 'trans' },
  { value: '4', label: 'Kan komma överens om hur turtagning fungerar', stage: 'trans' },
  { value: '5', label: 'Full turtagning', stage: 'full' }
] as const;

const instruktionOptions = [
  { value: '1', label: 'Tar inte/förstår inte instruktion', stage: 'ej' },
  { value: '2', label: 'Tar/förstår instruktion i ett led men startar inte en uppgift', stage: 'ej' },
  { value: '3', label: 'Tar/förstår instruktion i flera led, kan lösa uppgift ibland', stage: 'trans' },
  { value: '4', label: 'Kan prata om uppgiftslösning', stage: 'trans' },
  { value: '5', label: 'Genomför uppgifter', stage: 'full' }
] as const;

const arbetaSjalvOptions = [
  { value: '1', label: 'Klarar inte', stage: 'ej' },
  { value: '2', label: 'Löser en uppgift med stöd', stage: 'ej' },
  { value: '3', label: 'Kan klara uppgifter självständigt i klassrummet', stage: 'trans' },
  { value: '4', label: 'Gör ofta läxor och pratar om dem', stage: 'trans' },
  { value: '5', label: 'Tar ansvar för självständigt arbete utanför skolan', stage: 'full' }
] as const;

const tidOptions = [
  { value: '1', label: 'Ingen tidsuppfattning', stage: 'ej' },
  { value: '2', label: 'Börjar använda andra konkreta referenser', stage: 'ej' },
  { value: '3', label: 'Har begrepp för en kvart', stage: 'trans' },
  { value: '4', label: 'Kan beskriva tidslängd och ordningsförlopp', stage: 'trans' },
  { value: '5', label: 'God tidsuppfattning', stage: 'full' }
] as const;


const StudentEvaluationForm = ({ evaluationId }: { evaluationId?: number }) => {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
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
        toast.error('Kunde inte hämta utvärderingen', {
          id: 'loading-data', // Replace the loading toast
        });
      }
    };

    fetchData();
  }, [evaluationId]);

  // For unsaved changes warning
  const handleFieldChange = (newValue: any) => {
    setFormData(newValue);
    toast.info('Kom ihåg att spara dina ändringar!', {
      id: 'unsaved-changes', // Only show one of these at a time
      duration: 2000,
    });
  };

  // For validation errors
  const validateForm = () => {
    const errors = []; // Your validation logic here

    if (errors.length > 0) {
      toast.error('Vänligen åtgärda följande:', {
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        ),
        duration: 5000,
      });
      return false;
    }
    return true;
  };

  // Loading notifications
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

  // Progress Header Props
  interface ProgressHeaderProps {
    stages: Array<{
      label: string;
      type: 'ej' | 'trans' | 'full';
    }>;
  }

  // Progress Header Component
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
            className={`flex-1 text-center p-2 text-sm ${headerStageClasses[stage.type]}`}
          >
            {stage.label}
          </div>
        ))}
      </div>
    );
  };



  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Anknytningstecken</CardTitle>
        </CardHeader>
        <CardContent>
        <SubSection
            title="Närvaro"
            name="narvaro"
            options={narvaroOptions}
            value={formData?.anknytning?.narvaro ?? ''}
            onChange={handleValueChange('anknytning', 'narvaro')}
            onCommentChange={handleCommentChange('anknytning', 'narvaro')}
            comment={formData?.anknytning?.comments?.narvaro ?? ''}
            sectionKey="anknytning"
            fieldName="narvaro"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Dialog 1"
            name="dialog1"
            options={dialog1Options}
            value={formData?.anknytning?.dialog1 ?? ''}
            onChange={handleValueChange('anknytning', 'dialog1')}
            onCommentChange={handleCommentChange('anknytning', 'dialog1')}
            comment={formData?.anknytning?.comments?.dialog1 ?? ''}
            sectionKey="anknytning"
            fieldName="dialog1"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Dialog 2"
            name="dialog2"
            options={dialog2Options}
            value={formData?.anknytning?.dialog2 ?? ''}
            onChange={handleValueChange('anknytning', 'dialog2')}
            onCommentChange={handleCommentChange('anknytning', 'dialog2')}
            comment={formData?.anknytning?.comments?.dialog2 ?? ''}
            sectionKey="anknytning"
            fieldName="dialog2"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Blick, kroppsspråk"
            name="blick"
            options={blickOptions}
            value={formData?.anknytning?.blick ?? ''}
            onChange={handleValueChange('anknytning', 'blick')}
            onCommentChange={handleCommentChange('anknytning', 'blick')}
            comment={formData?.anknytning?.comments?.blick ?? ''}
            sectionKey="anknytning"
            fieldName="blick"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Beröring"
            name="beroring"
            options={beroringOptions}
            value={formData?.anknytning?.beroring ?? ''}
            onChange={handleValueChange('anknytning', 'beroring')}
            onCommentChange={handleCommentChange('anknytning', 'beroring')}
            comment={formData?.anknytning?.comments?.beroring ?? ''}
            sectionKey="anknytning"
            fieldName="beroring"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Vid konflikt"
            name="konflikt"
            options={konfliktOptions}
            value={formData?.anknytning?.konflikt ?? ''}
            onChange={handleValueChange('anknytning', 'konflikt')}
            onCommentChange={handleCommentChange('anknytning', 'konflikt')}
            comment={formData?.anknytning?.comments?.konflikt ?? ''}
            sectionKey="anknytning"
            fieldName="konflikt"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Förtroende"
            name="fortroende"
            options={fortroendeOptions}
            value={formData?.anknytning?.fortroende ?? ''}
            onChange={handleValueChange('anknytning', 'fortroende')}
            onCommentChange={handleCommentChange('anknytning', 'fortroende')}
            comment={formData?.anknytning?.comments?.fortroende ?? ''}
            sectionKey="anknytning"
            fieldName="fortroende"
            calculateProgress={calculateSectionProgress}
          />

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
          <CardTitle>Ansvarstecken</CardTitle>
        </CardHeader>
        <CardContent>
          <SubSection
            title="Impulskontroll"
            name="impulskontroll"
            options={impulskontrollOptions}
            value={formData?.ansvar?.impulskontroll ?? ''}
            onChange={handleValueChange('ansvar', 'impulskontroll')}
            onCommentChange={handleCommentChange('ansvar', 'impulskontroll')}
            comment={formData?.ansvar?.comments?.impulskontroll ?? ''}
            sectionKey="ansvar"
            fieldName="impulskontroll"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Förberedd"
            name="forberedd"
            options={forberedddOptions}
            value={formData?.ansvar?.forberedd ?? ''}
            onChange={handleValueChange('ansvar', 'forberedd')}
            onCommentChange={handleCommentChange('ansvar', 'forberedd')}
            comment={formData?.ansvar?.comments?.forberedd ?? ''}
            sectionKey="ansvar"
            fieldName="forberedd"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Fokus"
            name="fokus"
            options={fokusOptions}
            value={formData?.ansvar?.fokus ?? ''}
            onChange={handleValueChange('ansvar', 'fokus')}
            onCommentChange={handleCommentChange('ansvar', 'fokus')}
            comment={formData?.ansvar?.comments?.fokus ?? ''}
            sectionKey="ansvar"
            fieldName="fokus"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Turtagning"
            name="turtagning"
            options={turtagningOptions}
            value={formData?.ansvar?.turtagning ?? ''}
            onChange={handleValueChange('ansvar', 'turtagning')}
            onCommentChange={handleCommentChange('ansvar', 'turtagning')}
            comment={formData?.ansvar?.comments?.turtagning ?? ''}
            sectionKey="ansvar"
            fieldName="turtagning"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Instruktion"
            name="instruktion"
            options={instruktionOptions}
            value={formData?.ansvar?.instruktion ?? ''}
            onChange={handleValueChange('ansvar', 'instruktion')}
            onCommentChange={handleCommentChange('ansvar', 'instruktion')}
            comment={formData?.ansvar?.comments?.instruktion ?? ''}
            sectionKey="ansvar"
            fieldName="instruktion"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Arbeta själv"
            name="arbeta_sjalv"
            options={arbetaSjalvOptions}
            value={formData?.ansvar?.arbeta_sjalv ?? ''}
            onChange={handleValueChange('ansvar', 'arbeta_sjalv')}
            onCommentChange={handleCommentChange('ansvar', 'arbeta_sjalv')}
            comment={formData?.ansvar?.comments?.arbeta_sjalv ?? ''}
            sectionKey="ansvar"
            fieldName="arbeta_sjalv"
            calculateProgress={calculateSectionProgress}
          />
          <SubSection
            title="Tid"
            name="tid"
            options={tidOptions}
            value={formData?.ansvar?.tid ?? ''}
            onChange={handleValueChange('ansvar', 'tid')}
            onCommentChange={handleCommentChange('ansvar', 'tid')}
            comment={formData?.ansvar?.comments?.tid ?? ''}
            sectionKey="ansvar"
            fieldName="tid"
            calculateProgress={calculateSectionProgress}
          />

          <div className="mt-8">
            <ProgressHeader
              stages={[
                { label: 'Ej elev', type: 'ej' },
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

      <Button
        type="submit"
        className="w-full md:w-auto"
        disabled={isSaving}
      >
        {isSaving ? 'Sparar...' : 'Spara'}
      </Button>
    </form>
  );

};

export default StudentEvaluationForm;
