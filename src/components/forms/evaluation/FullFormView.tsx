// src/components/forms/evaluation/FullFormView.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormData, FormSection, QuestionsStructure } from '@/lib/types/formTypesEvaluation';
import { stageClasses, getOptionClasses } from '@/components/ui/evaluation/styles';
import ProgressHeader from '@/components/ui/evaluation/ProgressHeader';
import ProgressBar from '@/components/ui/evaluation/ProgressBar';
import LoadingDots from '@/components/ui/LoadingDots';

interface FullFormViewProps {
  formData: FormData;
  questionsStructure: QuestionsStructure;
  toggleFullForm: () => void;
  handleQuestionChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  handleCommentChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  calculateProgress: (sectionId: keyof FormData, questionId: string) => number;
  calculateSectionProgress: (sectionId: keyof FormData) => number;
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  evaluationId?: number;
  handleResetForm?: () => void;
}

/**
 * Full Form View component
 * Displays all questions at once grouped by section
 */
const FullFormView: React.FC<FullFormViewProps> = ({
  formData,
  questionsStructure,
  toggleFullForm,
  handleQuestionChange,
  handleCommentChange,
  calculateProgress,
  calculateSectionProgress,
  isSaving,
  handleSubmit,
  evaluationId,
  handleResetForm
}) => {
  return (
    <div className="space-y-8">
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress för detta avsnitt</span>
              <span className="text-sm font-medium">{Math.round(calculateSectionProgress(sectionId as keyof FormData))}%</span>
            </div>
            <ProgressBar 
              value={calculateSectionProgress(sectionId as keyof FormData)} 
              type="section" 
            />
          </div>
          
          {/* Questions directly in the section */}
          {section.questions && Object.entries(section.questions).map(([questionId, question]) => (
            <Card key={questionId} className="mb-6 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{question.text}</CardTitle>
                <ProgressBar 
                  value={calculateProgress(sectionId as keyof FormData, questionId)} 
                  type="section" 
                />
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
                    <ProgressBar 
                      value={calculateProgress(sectionId as keyof FormData, questionId)} 
                      type="section" 
                    />
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
          type="button" 
          variant="outline" 
          onClick={toggleFullForm}
        >
          Visa en fråga i taget
        </Button>
        
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
  );
};

export default FullFormView;
