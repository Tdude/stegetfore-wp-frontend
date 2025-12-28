// src/components/forms/evaluation/FullFormView.tsx

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronsDownUp } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormData, QuestionsStructure } from '@/lib/types/formTypesEvaluation';
import { getOptionClasses } from '@/components/ui/evaluation/styles';
import ProgressHeader from '@/components/ui/evaluation/ProgressHeader';
import { DualSectionProgressBar } from '@/components/ui/evaluation/ProgressBar';
import LoadingDots from '@/components/ui/LoadingDots';

interface FullFormViewProps {
  formData: FormData;
  questionsStructure: QuestionsStructure;
  handleQuestionChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  handleCommentChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  calculateSectionStats: (sectionId: keyof FormData) => {
    totalQuestions: number;
    answered: number;
    nonZero: number;
    avg: number;
  };
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  evaluationId?: number;
  isFormSaved: boolean;
  toggleFullForm: () => void; // Added missing property
}

/**
 * Full Form View component
 * Displays all questions at once grouped by section
 */
const FullFormView: React.FC<FullFormViewProps> = ({
  formData,
  questionsStructure,
  handleQuestionChange,
  handleCommentChange,
  calculateSectionStats,
  isSaving,
  handleSubmit,
  evaluationId,
  isFormSaved,
  toggleFullForm
}) => {
  const minimapRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<{ topPct: number; heightPct: number }>({
    topPct: 0,
    heightPct: 0
  });

  const allQuestionRefs = useMemo(() => {
    const result: Array<{ sectionId: keyof FormData; questionId: string }> = [];

    Object.entries(questionsStructure).forEach(([sectionId, section]) => {
      if (section.questions) {
        Object.keys(section.questions).forEach(questionId => {
          result.push({ sectionId: sectionId as keyof FormData, questionId });
        });
      }

      if (section.subsections) {
        Object.values(section.subsections).forEach(subsection => {
          if (subsection.questions) {
            Object.keys(subsection.questions).forEach(questionId => {
              result.push({ sectionId: sectionId as keyof FormData, questionId });
            });
          }
        });
      }
    });

    return result;
  }, [questionsStructure]);

  const getAnswerColor = (answer: string | undefined) => {
    if (!answer) return 'rgb(209, 213, 219)'; // gray-300
    const numeric = parseInt(answer, 10);
    if (Number.isNaN(numeric)) return 'rgb(209, 213, 219)';

    const clamped = Math.min(5, Math.max(1, numeric));
    const t = (clamped - 1) / 4; // 0..1
    const hue = 0 + 120 * t; // 0=red -> 120=green
    return `hsl(${hue} 80% 45%)`;
  };

  useEffect(() => {
    const computeViewport = () => {
      const docEl = document.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop || 0;
      const scrollHeight = docEl.scrollHeight || 1;
      const clientHeight = window.innerHeight || docEl.clientHeight || 1;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);

      const topPct = Math.max(0, Math.min(100, (scrollTop / maxScroll) * 100));
      const heightPct = Math.max(0, Math.min(100, (clientHeight / scrollHeight) * 100));

      setViewport({ topPct, heightPct });
    };

    computeViewport();
    window.addEventListener('scroll', computeViewport, { passive: true });
    window.addEventListener('resize', computeViewport);

    return () => {
      window.removeEventListener('scroll', computeViewport);
      window.removeEventListener('resize', computeViewport);
    };
  }, []);

  const handleMinimapClick = (e: React.MouseEvent) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, y / Math.max(1, rect.height)));

    const docEl = document.documentElement;
    const scrollHeight = docEl.scrollHeight || 1;
    const clientHeight = window.innerHeight || docEl.clientHeight || 1;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);

    window.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
  };

  // If the form is saved, show success message
  if (isFormSaved) {
    const wpAdminAssessmentsUrl = 'https://cms.stegetfore.nu/wp-admin/admin.php?page=ham-assessments';

    return (
      <div className="container max-w-3xl mx-auto p-4">
        <div className="bg-green-50 dark:bg-form-success/10 border border-green-200 dark:border-form-success/30 rounded-lg p-6 text-center shadow-md dark:shadow-dark-md">
          <div className="text-green-600 dark:text-form-success text-4xl mb-4">✓</div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">Utvärderingen har sparats!</h3>
          <p className="text-gray-600 dark:text-text-secondary mb-6">
            Tack för att du slutförde utvärderingen. Den har sparats i systemet.
            {evaluationId && <span className="block mt-2 text-sm">Evaluation ID: {evaluationId}</span>}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="default"
              className="bg-primary hover:bg-primary/90 dark:text-primary-foreground"
            >
              Tillbaka till start
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 dark:border-primary/70 dark:text-primary dark:hover:bg-primary/20"
            >
              Ny utvärdering
            </Button>

            <Button
              onClick={() => window.open(wpAdminAssessmentsUrl, '_blank', 'noopener,noreferrer')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 dark:border-primary/70 dark:text-primary dark:hover:bg-primary/20"
            >
              WordPress admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            <Card className="mb-8 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Utvärdering</CardTitle>
                <p className="text-secondary">Fyll i alla frågor nedan</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-8">
                  <DualSectionProgressBar 
                    anknytningStats={calculateSectionStats("anknytning")} 
                    ansvarStats={calculateSectionStats("ansvar")}
                  />
                
                  <ProgressHeader 
                    stages={[
                      { type: 'ej', label: 'Ej uppnått' },
                      { type: 'trans', label: 'På väg' },
                      { type: 'full', label: 'Uppnått' }
                    ]} 
                  />
                
                  {Object.entries(questionsStructure).map(([sectionId, section]) => (
                    <div key={sectionId} className="mb-12">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                      </div>
                      
                      {section.questions && Object.entries(section.questions).map(([questionId, question]) => (
                        <Card key={questionId} className="mb-6 shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg">{question.text}</CardTitle>
                          </CardHeader>
                          
                          <CardContent>
                            <RadioGroup 
                              value={formData[sectionId as keyof FormData]?.questions?.[questionId] || ''} 
                              onValueChange={handleQuestionChange(sectionId as keyof FormData, questionId)}
                            >
                              <div className="space-y-3">
                                {question.options.map((option) => (
                                  <div 
                                    key={option.value} 
                                    className={getOptionClasses(formData[sectionId as keyof FormData]?.questions?.[questionId] === option.value)}
                                  >
                                    <RadioGroupItem value={option.value} id={`${sectionId}-${questionId}-${option.value}`} />
                                    <Label 
                                      htmlFor={`${sectionId}-${questionId}-${option.value}`}
                                      className="text-base cursor-pointer flex-1"
                                    >
                                      {option.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </RadioGroup>
                            
                            <Textarea
                              value={formData[sectionId as keyof FormData]?.comments?.[questionId] || ''}
                              onChange={(e) => handleCommentChange(sectionId as keyof FormData, questionId)(e.target.value)}
                              placeholder="Kommentar..."
                              className="mt-4"
                            />
                          </CardContent>
                        </Card>
                      ))}
                      
                      {section.subsections && Object.entries(section.subsections).map(([subsectionId, subsection]) => (
                        <div key={subsectionId} className="mb-8">
                          <h3 className="text-xl font-semibold mb-4">{subsection.title}</h3>
                          
                          {subsection.questions && Object.entries(subsection.questions).map(([questionId, question]) => (
                            <Card key={questionId} className="mb-6 shadow-sm">
                              <CardHeader>
                                <CardTitle className="text-lg">{question.text}</CardTitle>
                              </CardHeader>
                              
                              <CardContent>
                                <RadioGroup 
                                  value={formData[sectionId as keyof FormData]?.questions?.[questionId] || ''} 
                                  onValueChange={handleQuestionChange(sectionId as keyof FormData, questionId)}
                                >
                                  <div className="space-y-3">
                                    {question.options.map((option) => (
                                      <div 
                                        key={option.value} 
                                        className={getOptionClasses(formData[sectionId as keyof FormData]?.questions?.[questionId] === option.value)}
                                      >
                                        <RadioGroupItem value={option.value} id={`${sectionId}-${questionId}-${option.value}`} />
                                        <Label 
                                          htmlFor={`${sectionId}-${questionId}-${option.value}`}
                                          className="text-base cursor-pointer flex-1"
                                        >
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </RadioGroup>
                                
                                <Textarea
                                  value={formData[sectionId as keyof FormData]?.comments?.[questionId] || ''}
                                  onChange={(e) => handleCommentChange(sectionId as keyof FormData, questionId)(e.target.value)}
                                  placeholder="Kommentar..."
                                  className="mt-4"
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                
                  <div className="flex justify-between items-center mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleFullForm}
                      className="flex items-center gap-2"
                    >
                      <span className="flex items-center gap-1">
                        <ChevronsDownUp size={16} />
                      </span>
                      Visa frågor en och en
                    </Button>

                    <Button 
                      type="submit" 
                      onClick={(e) => {
                        e.preventDefault();
                        const hasAnsweredQuestions = 
                          Object.keys(formData.anknytning?.questions || {}).length > 0 || 
                          Object.keys(formData.ansvar?.questions || {}).length > 0;
                        
                        if (!hasAnsweredQuestions) {
                          alert('Du måste besvara minst en fråga innan du kan skicka in formuläret.');
                          return;
                        }
                        
                        handleSubmit(e);
                      }}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
                    >
                      {isSaving ? <LoadingDots text="Sparar" /> : evaluationId ? 'Uppdatera utvärdering' : 'Spara utvärdering'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="block w-40 shrink-0">
          <div
            ref={minimapRef}
            onClick={handleMinimapClick}
            role="button"
            tabIndex={0}
            className="sticky top-4 h-[calc(100vh-2rem)] rounded-lg border border-muted-foreground/20 bg-muted/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 p-2">
              <div className="space-y-1">
                {allQuestionRefs.map(({ sectionId, questionId }, idx) => {
                  const answer = formData[sectionId]?.questions?.[questionId];
                  const color = getAnswerColor(answer);
                  return (
                    <div
                      key={`${sectionId}:${questionId}:${idx}`}
                      className="h-2 rounded"
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>

            <div
              className="absolute left-0 right-0 border-2 border-primary/70 bg-primary/10 pointer-events-none"
              style={{ top: `${viewport.topPct}%`, height: `${viewport.heightPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullFormView;
