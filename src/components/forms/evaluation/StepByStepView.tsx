// src/components/forms/evaluation/StepByStepView.tsx
'use client';

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { FormData, Question } from '@/lib/types/formTypesEvaluation';
import QuestionCard from '@/components/ui/evaluation/QuestionCard';
import { DualSectionProgressBar } from '@/components/ui/evaluation/ProgressBar';
import LoadingDots from '@/components/ui/LoadingDots';

interface StepByStepViewProps {
  formData: FormData;
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
}

/**
 * Step-by-step view for the evaluation form
 * Shows one question at a time with navigation controls
 */
const StepByStepView: React.FC<StepByStepViewProps> = ({
  formData,
  allQuestions,
  currentQuestionIndex,
  currentSection,
  fadeState,
  handlePrevQuestion,
  handleNextQuestion,
  toggleFullForm,
  handleStepByStepQuestionChange,
  handleCommentChange,
  calculateSectionStats,
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
        <div className="bg-green-50 dark:bg-form-success/10 border border-green-200 dark:border-form-success/30 rounded-lg p-6 text-center shadow-md dark:shadow-dark-md">
          <div className="text-green-600 dark:text-form-success text-4xl mb-4">✓</div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">Observationen har sparats!</h3>
          <p className="text-gray-600 dark:text-text-secondary mb-6">
            Tack för att du slutförde observationen. Den har sparats i systemet.
            {evaluationId && typeof evaluationId === 'number' && !isNaN(evaluationId) &&
              <span className="block mt-2 text-sm">Utvärderingen har ID: {evaluationId}</span>
            }
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium mb-4 text-foreground">Formulär för observation</h2>
      </div>

      <DualSectionProgressBar
        anknytningStats={calculateSectionStats("anknytning")}
        ansvarStats={calculateSectionStats("ansvar")}
      />

      <div className="relative" ref={questionContainerRef}>
        {/* Left chevron (previous) */}
        {currentQuestionIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevQuestion}
            aria-label="Föregående fråga"
            className="hidden sm:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 rounded-full bg-white/80 dark:bg-surface-secondary/80 shadow-md hover:bg-white dark:hover:bg-surface-secondary hover:scale-105 transition-transform transition-colors z-20"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right chevron (next) */}
        {currentQuestion && currentQuestionIndex < allQuestions.length - 1 && (
          <button
            type="button"
            onClick={handleNextQuestion}
            aria-label="Nästa fråga"
            disabled={!
              formData[currentSection]?.questions?.[currentQuestion.questionId]
            }
            className={`hidden sm:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 rounded-full bg-white/80 dark:bg-surface-secondary/80 shadow-md hover:bg-white dark:hover:bg-surface-secondary hover:scale-105 transition-transform transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              !formData[currentSection]?.questions?.[currentQuestion.questionId]
                ? 'z-0 pointer-events-none'
                : 'z-20'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div
          className={`transition-opacity duration-500 ${fadeState === 'fading-out' ? 'opacity-0' : 'opacity-100'}`}
        >
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion.question}
              questionId={currentQuestion.questionId}
              value={formData[currentQuestion.sectionId]?.questions?.[currentQuestion.questionId] || ''}
              comment={formData[currentQuestion.sectionId]?.comments?.[currentQuestion.questionId] || ''}
              onChange={handleStepByStepQuestionChange(currentQuestion.sectionId, currentQuestion.questionId)}
              onCommentChange={handleCommentChange(currentQuestion.sectionId, currentQuestion.questionId)}
              currentIndex={currentQuestionIndex}
              totalQuestions={allQuestions.length}
            />
          )}
        </div>
      </div>

      {/* Mobile navigation (visible only on small screens) */}
      <div className="flex items-center justify-between mt-4 sm:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center justify-center w-10 h-10 rounded-full p-0"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentQuestionIndex + 1} / {allQuestions.length}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleNextQuestion}
          disabled={
            currentQuestionIndex === allQuestions.length - 1 ||
            !currentQuestion ||
            !formData[currentSection]?.questions?.[currentQuestion.questionId]
          }
          className="flex items-center justify-center w-10 h-10 rounded-full p-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="flex justify-between items-center mt-8">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={toggleFullForm}
            className="flex items-center gap-2"
          >
            <ChevronsUpDown size={16} />
            Visa alla frågor
          </Button>

          {currentQuestionIndex === allQuestions.length - 1 && (
            <Button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                // Make sure at least one question is answered
                const hasAnsweredQuestions =
                  Object.keys(formData.anknytning?.questions || {}).length > 0 ||
                  Object.keys(formData.ansvar?.questions || {}).length > 0;

                if (!hasAnsweredQuestions) {
                  // Alert user if no questions are answered
                  alert('Du måste besvara minst en fråga innan du kan skicka in formuläret.');
                  return;
                }

                // Proceed with submission if questions are answered
                handleSubmit(e);
              }}
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
