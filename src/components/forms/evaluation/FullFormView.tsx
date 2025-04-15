// src/components/forms/evaluation/FullFormView.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormData, QuestionsStructure } from '@/lib/types/formTypesEvaluation';
import { getOptionClasses } from '@/components/ui/evaluation/styles';
import ProgressHeader from '@/components/ui/evaluation/ProgressHeader';
import DualSectionProgressBar from '@/components/ui/evaluation/ProgressBar';
import LoadingDots from '@/components/ui/LoadingDots';

interface FullFormViewProps {
  formData: FormData;
  questionsStructure: QuestionsStructure;
  handleQuestionChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  handleCommentChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  calculateSectionProgress: (sectionId: keyof FormData) => number;
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  evaluationId?: number;
  isFormSaved: boolean;
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
  calculateSectionProgress,
  isSaving,
  handleSubmit,
  evaluationId,
  isFormSaved
}) => {
  // If the form is saved, show success message
  if (isFormSaved) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center shadow-md">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h3 className="text-xl font-semibold mb-3">Utvärderingen har sparats!</h3>
          <p className="text-gray-600 mb-6">
            Tack för att du slutförde utvärderingen. Den har sparats i systemet.
            {evaluationId && <span className="block mt-2 text-sm">Evaluation ID: {evaluationId}</span>}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="default"
              className="bg-primary hover:bg-primary/90"
            >
              Tillbaka till start
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Ny utvärdering
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Utvärdering</CardTitle>
            <p className="text-muted-foreground">Fyll i alla frågor nedan</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-8">
              {/* Add the dual section progress bars at the top of the form */}
              {/* Defensive check for DualSectionProgressBar props */}
              {/* If you see errors about anknytningProgress/ansvarProgress, ensure you're passing correct props to DualSectionProgressBar */}
              {/* For now, add a type assertion or fallback values */}
              <DualSectionProgressBar 
                anknytningProgress={calculateSectionProgress("anknytning") || 0} 
                ansvarProgress={calculateSectionProgress("ansvar") || 0}
              />
            
              {/* Progress header */}
              <ProgressHeader 
                stages={[
                  { type: 'ej', label: 'Ej uppnått' },
                  { type: 'trans', label: 'På väg' },
                  { type: 'full', label: 'Uppnått' }
                ]} 
              />
            
              {/* Sections */}
              {Object.entries(questionsStructure).map(([sectionId, section]) => (
                <div key={sectionId} className="mb-12">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                  </div>
                  
                  {/* Questions directly in the section */}
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
                  
                  {/* Subsections */}
                  {section.subsections && Object.entries(section.subsections).map(([subsectionId, subsection]) => (
                    <div key={subsectionId} className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">{subsection.title}</h3>
                      
                      {/* Questions */}
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
            
              {/* Form actions */}
              <div className="flex justify-between items-center mt-8">
                <Button 
                  type="submit" 
                  onClick={handleSubmit}
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
  );
};

export default FullFormView;
