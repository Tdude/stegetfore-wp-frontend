// src/components/forms/evaluation/StepByStepView.tsx
'use client';

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { FormData, QuestionsStructure } from '@/lib/types/formTypesEvaluation';
import QuestionCard from '@/components/ui/evaluation/QuestionCard';
import ProgressBar from '@/components/ui/evaluation/ProgressBar';

interface StepByStepViewProps {
  formData: FormData;
  questionsStructure: QuestionsStructure;
  allQuestions: Array<{
    sectionId: keyof FormData;
    questionId: string;
    question: any;
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
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  evaluationId?: number;
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
  isSaving,
  handleSubmit,
  evaluationId
}) => {
  const questionCardRef = useRef<HTMLDivElement>(null);
  
  // Current question data
  const currentQuestionData = allQuestions[currentQuestionIndex] || null;
  
  // If no current question, show a message
  if (!currentQuestionData) {
    return <div>No questions available</div>;
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress totalt</span>
          {/*<span className="text-sm font-medium">{Math.round((currentQuestionIndex / allQuestions.length) * 100)}%</span>*/}
        </div>
        <ProgressBar 
          value={Math.round((currentQuestionIndex / allQuestions.length) * 100)} 
          type="total" 
        />
      </div>

      {/* Question card with fade animation */}
      <div 
        ref={questionCardRef}
        className={`transition-opacity duration-500 ${
          fadeState === 'fading-out' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentQuestionData && (
          <QuestionCard
            question={currentQuestionData.question}
            questionId={currentQuestionData.questionId}
            sectionId={currentQuestionData.sectionId}
            value={formData[currentQuestionData.sectionId]?.questions?.[currentQuestionData.questionId] || ''}
            comment={formData[currentQuestionData.sectionId]?.comments?.[currentQuestionData.questionId] || ''}
            onChange={handleStepByStepQuestionChange(currentQuestionData.sectionId, currentQuestionData.questionId)}
            onCommentChange={handleCommentChange(currentQuestionData.sectionId, currentQuestionData.questionId)}
            calculateProgress={calculateProgress}
            currentIndex={currentQuestionIndex}
            totalQuestions={allQuestions.length}
          />
        )}
      </div>

      {/* Navigation buttons */}
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
            disabled={currentQuestionIndex === allQuestions.length - 1}
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
              {isSaving ? 'Sparar...' : evaluationId ? 'Uppdatera utvärdering' : 'Spara utvärdering'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepByStepView;
