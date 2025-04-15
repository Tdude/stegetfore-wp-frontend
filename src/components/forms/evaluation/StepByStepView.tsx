// src/components/forms/evaluation/StepByStepView.tsx
'use client';

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { FormData, QuestionsStructure, Question } from '@/lib/types/formTypesEvaluation';
import QuestionCard from '@/components/ui/evaluation/QuestionCard';
import ProgressBar, { DualSectionProgressBar } from '@/components/ui/evaluation/ProgressBar';
import LoadingDots from '@/components/ui/LoadingDots';

interface StepByStepViewProps {
  formData: FormData;
  questionsStructure: QuestionsStructure;
  allQuestions: Array<{
    sectionId: keyof FormData;
    questionId: string;
    question: Question;
  }>;
  currentQuestionIndex: number;
  currentSection: keyof FormData;
  fadeState: 'visible' | 'fading-out' | 'fading-in';
  handlePrevQuestion: () => void;
  handleNextQuestion: () => void;
  toggleFullForm: () => void;
  handleStepByStepQuestionChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  handleCommentChange: (sectionId: keyof FormData, questionId: string) => (value: string) => void;
  calculateProgress: (sectionId: keyof FormData, questionId: string) => number;
  calculateSectionProgress: (sectionId: keyof FormData) => number;
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  evaluationId?: number;
  isFormSaved: boolean;
}

/**
 * Step-by-step view for the evaluation form
 * Shows one question at a time with navigation controls
 */
const StepByStepView: React.FC<StepByStepViewProps> = ({
  formData,
  questionsStructure,
  allQuestions,
  currentQuestionIndex,
  currentSection,
  fadeState,
  handlePrevQuestion,
  handleNextQuestion,
  toggleFullForm,
  handleStepByStepQuestionChange,
  handleCommentChange,
  calculateProgress,
  calculateSectionProgress,
  isSaving,
  handleSubmit,
  evaluationId,
  isFormSaved
}) => {
  const questionContainerRef = useRef<HTMLDivElement>(null);
  
  // Current question data
  const currentQuestion = allQuestions[currentQuestionIndex];
  
  // If there's no current question (e.g., no questions loaded yet), show loading state
  if (!currentQuestion && !isFormSaved) {
    return <div className="flex items-center justify-center p-10">Laddar frågor...</div>;
  }

  // If the form is saved, show success message
  if (isFormSaved) {
    return (
      <div className="w-full max-w-lg mx-auto mt-4">
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
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Utvärdering</h2>
      </div>
      
      <DualSectionProgressBar 
        anknytningProgress={calculateSectionProgress("anknytning")} 
        ansvarProgress={calculateSectionProgress("ansvar")}
      />
      
      <div 
        ref={questionContainerRef}
        className={`transition-opacity duration-500 ${
          fadeState === 'fading-out' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion.question}
            questionId={currentQuestion.questionId}
            sectionId={currentQuestion.sectionId}
            value={formData[currentQuestion.sectionId]?.questions?.[currentQuestion.questionId] || ''}
            comment={formData[currentQuestion.sectionId]?.comments?.[currentQuestion.questionId] || ''}
            onChange={handleStepByStepQuestionChange(currentQuestion.sectionId, currentQuestion.questionId)}
            onCommentChange={handleCommentChange(currentQuestion.sectionId, currentQuestion.questionId)}
            calculateProgress={calculateProgress}
            currentIndex={currentQuestionIndex}
            totalQuestions={allQuestions.length}
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-8">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Föregående
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === allQuestions.length - 1 || 
              !formData[currentSection]?.questions?.[currentQuestion.questionId]}
            className="flex items-center gap-2"
          >
            Nästa
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={toggleFullForm}
            className="flex items-center gap-2"
          >
            <List size={16} />
            Visa alla frågor
          </Button>
        
          {currentQuestionIndex === allQuestions.length - 1 && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
            >
              {isSaving ? <LoadingDots text="Sparar" /> : evaluationId ? 'Uppdatera utvärdering' : 'Spara utvärdering'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepByStepView;
