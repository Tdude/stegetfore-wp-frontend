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
    return (
      <div className="py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No questions are currently available for this evaluation. Please try refreshing the page or contact support if this issue persists.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={toggleFullForm}
        >
          Switch to Full Form View
        </button>
      </div>
    );
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
