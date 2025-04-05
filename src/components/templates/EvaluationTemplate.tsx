// components/templates/EvaluationTemplate.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import {
  FormData,
  FormSection,
  Question,
  Option,
  initialFormState,
  ProgressBarProps,
  QuestionsStructure,
  SubSectionProps,
  ProgressHeaderProps,
  StudentEvaluationFormProps,
  StageClasses,
  SectionData,
  EvaluationResponse
} from '@/lib/types/formTypesEvaluation';
import { evaluationApi } from '@/lib/api/formTryggveApi';

// Styling classes for different stages
const stageClasses: StageClasses = {
  ej: 'relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-red-300 before:to-amber-200 before:rounded mt-0 first:mt-0',
  trans: 'relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-200 before:to-green-200 before:rounded mt-0 first:mt-0',
  full: 'relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-green-200 before:rounded mt-0 first:mt-0'
};

// Progress Bar component with gradient support
const ProgressBar: React.FC<ProgressBarProps> = ({ value, type, stage }) => {
  const baseClasses = "h-2 rounded-full transition-all duration-300";
  const typeClasses = type === 'section' ? 'h-1' : 'h-6';

  // Create a gradient color based on the value
  const getProgressColor = (value: number, stage?: 'ej' | 'trans' | 'full') => {
    if (type === 'total' && stage === 'ej') return 'bg-red-500';
    
    // Gradient colors based on value
    if (value < 20) return 'bg-gradient-to-r from-red-600 to-red-400';
    if (value < 40) return 'bg-gradient-to-r from-red-400 to-amber-400';
    if (value < 60) return 'bg-gradient-to-r from-amber-400 to-amber-300';
    if (value < 80) return 'bg-gradient-to-r from-amber-300 to-green-400';
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };

  return (
    <div className="w-full bg-gray-50 rounded-full">
      <div
        className={`${baseClasses} ${typeClasses} ${getProgressColor(value, stage)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

// Question Card component for the multi-stage form
const QuestionCard: React.FC<{
  question: Question;
  questionId: string;
  sectionId: keyof FormData;
  value: string;
  comment: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  calculateProgress: (sectionId: keyof FormData, questionId: string) => number;
  currentIndex: number;
  totalQuestions: number;
}> = ({
  question,
  questionId,
  sectionId,
  value,
  comment,
  onChange,
  onCommentChange,
  calculateProgress,
  currentIndex,
  totalQuestions
}) => {
  // Use a ref to track if this is the initial render of this specific question
  const isInitialRender = useRef(true);
  
  // Track selected option for visual feedback - initialize with null to avoid pre-selection
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Reset selectedOption when question changes and sync with value only if it exists
  useEffect(() => {
    // Mark this as the initial render of this question
    isInitialRender.current = true;
    
    // Only set selectedOption to value if value exists (previously answered)
    // Otherwise, keep it null to avoid visual pre-selection
    if (value) {
      setSelectedOption(value);
    } else {
      setSelectedOption(null);
    }
  }, [questionId, value]);
  
  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    // No longer initial render after user interaction
    isInitialRender.current = false;
    
    // Set selected option for visual feedback
    setSelectedOption(optionValue);
    
    // Update parent state - this will now trigger auto-advance
    onChange(optionValue);
  };
  
  const progress = calculateProgress(sectionId, questionId);

  // Group options by stage
  const optionsByStage = useMemo(() => {
    return Object.entries(
      question.options.reduce((acc, opt) => {
        acc[opt.stage] = acc[opt.stage] || [];
        acc[opt.stage].push(opt);
        return acc;
      }, {} as Record<string, Option[]>)
    );
  }, [question.options]);

  // CSS classes for different stages
  const stageClasses = {
    "1": "mb-6",
    "2": "mb-6",
    "3": "mb-6"
  };
  
  // Enhanced visual feedback for selected options without layout shifts
  const getOptionClasses = (optionValue: string) => {
    const isSelected = selectedOption === optionValue;
    return `flex items-center border-2 space-x-4 p-3 rounded-md cursor-pointer transition-all duration-300 relative ${
      isSelected
        ? 'bg-primary/10 border-2 border-primary/20 shadow-md' 
        : 'hover:bg-gray-50 border border-transparent'
    }`;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">{question.text}</CardTitle>
          <div className="text-sm text-gray-500">
            Fråga {currentIndex + 1} av {totalQuestions}
          </div>
        </div>
        {/*<ProgressBar value={progress} type="section" />*/}
      </CardHeader>
      
      <CardContent>
        <RadioGroup value={value} onValueChange={handleOptionSelect}>
          {optionsByStage.map(([stage, stageOptions]) => (
            <div key={`${questionId}-${stage}`} className={stageClasses[stage as keyof typeof stageClasses]}>
              {stageOptions.map((option) => (
                <div 
                  key={`${questionId}-${option.value}`} 
                  className={getOptionClasses(option.value)}
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <RadioGroupItem value={option.value} id={`${questionId}-${option.value}`} />
                  <Label
                    htmlFor={`${questionId}-${option.value}`}
                    className="text-lg cursor-pointer flex-1"
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
          placeholder={`Kommentar...`}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
};

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
          className={`flex-1 text-center p-2 text-lg font-bold ${headerStageClasses[stage.type]}`}
        >
          {stage.label}
        </div>
      ))}
    </div>
  );
};

// Student Evaluation Form component
const StudentEvaluationForm: React.FC<StudentEvaluationFormProps> = ({ studentId: initialStudentId, evaluationId }) => {
  // State for form data
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questionsStructure, setQuestionsStructure] = useState<QuestionsStructure | null>(null);
  const [studentId, setStudentId] = useState<number | undefined>(
    initialStudentId ? Number(initialStudentId) : undefined
  );
  
  // Animation states
  const [fadeState, setFadeState] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');
  const questionCardRef = useRef<HTMLDivElement>(null);
  
  // Get all questions as a flat array for navigation
  const allQuestions = useMemo(() => {
    if (!questionsStructure) return [];
    
    const questions: {
      sectionId: keyof FormData;
      questionId: string;
      question: Question;
    }[] = [];
    
    Object.entries(questionsStructure || {}).forEach(([sectionId, section]) => {
      Object.entries(section.questions).forEach(([questionId, question]) => {
        questions.push({
          sectionId: sectionId as keyof FormData,
          questionId,
          question
        });
      });
    });
    
    return questions;
  }, [questionsStructure]);

  // State for multi-stage form
  const [currentSection, setCurrentSection] = useState<keyof FormData>('anknytning');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFullForm, setShowFullForm] = useState(false);
  
  // Navigation functions - defined before they're used in useEffect
  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      // Start fade out
      setFadeState('fading-out');
      
      // After fade out, change question
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setCurrentSection(allQuestions[currentQuestionIndex - 1]?.sectionId || 'anknytning');
        setFadeState('visible');
        
        // Scroll to the question card with smooth animation
        questionCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500); // 500ms delay to let the fade-out complete and answer linger
    }
  }, [currentQuestionIndex, allQuestions]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      // Start fade out
      setFadeState('fading-out');
      
      // After 500ms delay, change question
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentSection(allQuestions[currentQuestionIndex + 1]?.sectionId || 'anknytning');
        setFadeState('visible');
        
        // Scroll to the question card with smooth animation
        questionCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500); // 500ms delay to let the fade-out complete and answer linger
    }
  }, [currentQuestionIndex, allQuestions]);
  
  const toggleFullForm = useCallback(() => {
    setShowFullForm(!showFullForm);
  }, [showFullForm]);

  // For form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const loadingToast = toast.loading('Sparar utvärdering...');

    try {
      // Ensure studentId is valid
      if (!studentId) {
        throw new Error('Student ID is required to save evaluation');
      }

      // Transform form data to match backend structure
      const transformedData = {
        ...(evaluationId ? { id: evaluationId } : {}),
        anknytning: {
          questions: formData.anknytning.questions,
          comments: formData.anknytning.comments
        },
        ansvar: {
          questions: formData.ansvar.questions,
          comments: formData.ansvar.comments
        }
      };

      console.log('Sending evaluation data:', transformedData);
      const data = await evaluationApi.saveEvaluation(studentId, transformedData);

      toast.dismiss(loadingToast);
      toast.success('Utvärderingen sparades!');

      // If this was a new evaluation, we could redirect to edit mode
      if (!evaluationId && data.id) {
        // Optionally redirect or update URL with the new ID
        // window.location.href = `/evaluations/edit/${data.id}`;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.dismiss(loadingToast);
      toast.error('Ett fel uppstod när utvärderingen skulle sparas.');
    } finally {
      setIsSaving(false);
    }
  };

  // For data loading - both questions structure and evaluation data if editing
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // First, get the questions structure using the API client
        const questionsData = await evaluationApi.getQuestionsStructure();
        setQuestionsStructure(questionsData);

        // If evaluationId exists, fetch the evaluation data
        if (evaluationId) {
          const evalData = await evaluationApi.getEvaluation(evaluationId);
          
          // If we get student ID from the evaluation data, set it
          if (evalData.student_id && !studentId) {
            setStudentId(Number(evalData.student_id));
          }
          
          // Set form data from evaluation
          const newFormData = {
            anknytning: {
              questions: evalData.anknytning?.questions || {},
              comments: evalData.anknytning?.comments || {}
            },
            ansvar: {
              questions: evalData.ansvar?.questions || {},
              comments: evalData.ansvar?.comments || {}
            }
          };
          setFormData(newFormData);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Kunde inte ladda utvärderingen');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [evaluationId, studentId]);

  // For handling question value changes in the step-by-step view
  const handleStepByStepQuestionChange = useCallback((sectionId: keyof FormData, questionId: string) => (value: string) => {
    // Update form data
    setFormData((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        questions: {
          ...prev[sectionId].questions,
          [questionId]: value
        }
      }
    }));

    // Auto-advance to next question after a longer delay to let the user see their selection
    if (currentQuestionIndex < allQuestions.length - 1) {
      // Use a longer timeout (800ms) to allow users to see their selection before advancing
      setTimeout(() => {
        handleNextQuestion();
      }, 800);
    }
  }, [currentQuestionIndex, allQuestions.length, handleNextQuestion]);
  
  // For handling question value changes in the full form view
  const handleFullFormQuestionChange = useCallback((sectionId: keyof FormData, questionId: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        questions: {
          ...prev[sectionId].questions,
          [questionId]: value
        }
      }
    }));
  }, []);

  // For handling comment changes
  const handleCommentChange = useCallback((sectionId: keyof FormData, questionId: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        comments: {
          ...prev[sectionId].comments,
          [questionId]: value
        }
      }
    }));
  }, []);

  // Calculate progress for a specific question
  const calculateProgress = useCallback((sectionId: keyof FormData, questionId: string): number => {
    const value = formData[sectionId]?.questions?.[questionId];
    if (!value) return 0;

    const question = questionsStructure?.[sectionId]?.questions[questionId];
    if (!question) return 0;

    const option = question.options.find((opt) => opt.value === value);
    if (!option) return 0;

    switch (option.stage) {
      case 'full':
        return 100;
      case 'trans':
        return 50;
      case 'ej':
        return 25;
      default:
        return 0;
    }
  }, [formData, questionsStructure]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Laddar utvärderingsformulär...</div>;
  }

  if (!questionsStructure) {
    return <div className="flex justify-center p-8">Kunde inte ladda frågestrukturen.</div>;
  }

  // Current question data
  const currentQuestionData = allQuestions[currentQuestionIndex] || null;

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress totalt</span>
          {/*<span className="text-sm font-medium">{Math.round((currentQuestionIndex / allQuestions.length) * 100)}%</span>*/}
        </div>
        <ProgressBar value={Math.round((currentQuestionIndex / allQuestions.length) * 100)} type="total" />
      </div>

      {showFullForm ? (
        // Full form view
        <>
          {Object.entries(questionsStructure).map(([sectionId, section]) => (
            <Card key={sectionId}>
              <CardHeader>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Two column layout for bigger screens */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Split questions into two columns */}
                  {[0, 1].map((columnIndex) => {
                    const questionIdsForColumn = Object.keys(section.questions).filter((_, idx) =>
                      idx % 2 === columnIndex
                    );

                    return (
                      <div key={columnIndex} className="md:w-1/2">
                        {questionIdsForColumn.map((questionId) => (
                          <div key={questionId} className="mb-6">
                            <h3 className="text-lg font-bold mb-2">{section.questions[questionId].text}</h3>
                            <ProgressBar value={calculateProgress(sectionId as keyof FormData, questionId)} type="section" />

                            <RadioGroup 
                              value={formData[sectionId as keyof FormData]?.questions?.[questionId] || ''} 
                              className="mt-4"
                            >
                              {Object.entries(section.questions[questionId].options.reduce((acc, opt) => {
                                if (!acc[opt.stage]) acc[opt.stage] = [];
                                acc[opt.stage].push(opt);
                                return acc;
                              }, {} as Record<string, Option[]>)).map(([stage, stageOptions]) => (
                                <div key={stage} className={stageClasses[stage as keyof typeof stageClasses]}>
                                  {stageOptions.map((option) => (
                                    <div 
                                      key={option.value} 
                                      className={`flex items-center space-x-4 p-3 my-2 rounded-md cursor-pointer ${
                                        formData[sectionId as keyof FormData]?.questions?.[questionId] === option.value
                                          ? 'bg-primary/10 border border-primary/30' 
                                          : 'hover:bg-gray-50'
                                      }`}
                                      onClick={() => {
                                        handleFullFormQuestionChange(sectionId as keyof FormData, questionId)(option.value);
                                      }}
                                    >
                                      <RadioGroupItem value={option.value} id={`${questionId}-${option.value}`} />
                                      <Label 
                                        htmlFor={`${questionId}-${option.value}`} 
                                        className="text-lg cursor-pointer flex-1"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </RadioGroup>

                            <Textarea
                              value={formData[sectionId as keyof FormData]?.comments?.[questionId] || ''}
                              onChange={(e) => handleCommentChange(sectionId as keyof FormData, questionId)(e.target.value)}
                              placeholder={`Kommentar om ${section.questions[questionId].text.toLowerCase()}...`}
                              className="mt-4"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8">
                  {sectionId === 'anknytning' ? (
                    <ProgressHeader
                      stages={[
                        { label: 'Ej anknuten', type: 'ej' },
                        { label: 'Tecken på anknytning till mig', type: 'trans' },
                        { label: 'Anknytning spiller över', type: 'full' }
                      ]}
                    />
                  ) : (
                    <ProgressHeader
                      stages={[
                        { label: 'Ej elev', type: 'ej' },
                        { label: 'Under utveckling', type: 'trans' },
                        { label: 'Elev', type: 'full' }
                      ]}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center mt-8">
            <Button 
              type="button" 
              variant="outline"
              onClick={toggleFullForm}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
            >
              <ChevronLeft size={16} />
              Visa fråga för fråga
            </Button>
            
            <Button
              type="submit"
              className="px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
              disabled={isSaving}
            >
              {isSaving ? 'Sparar...' : evaluationId ? 'Uppdatera utvärdering' : 'Spara utvärdering'}
            </Button>
          </div>
        </>
      ) : (
        // Question-by-question view
        <>
          <div 
            ref={questionCardRef}
            className={`transition-opacity duration-500 ${
              fadeState === 'visible' ? 'opacity-100' : 
              fadeState === 'fading-out' ? 'opacity-0' : ''
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
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
            >
              <ChevronLeft size={16} />
              Tillbaka
            </Button>

            <Button
              type="button"
              onClick={() => setShowFullForm(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
            >
              <List size={16} />
              Visa hela formuläret
            </Button>

            {currentQuestionIndex === allQuestions.length - 1 ? (
              <Button
                type="submit"
                className="flex items-center gap-2 px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
              >
                {isSaving ? 'Sparar...' : 'Spara'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary/90 border rounded text-gray-700 hover:text-black"
              >
                Nästa
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </>
      )}
    </form>
  );
};

// Main EvaluationTemplate component
const EvaluationTemplate: React.FC<{ page: any, evaluationId?: number, studentId?: number | string }> = ({ 
  page, 
  evaluationId,
  studentId: propsStudentId
}) => {
  // Extract student ID from page if available
  const pageStudentId = page?.meta?.student_id || page?.studentId;
  const studentId = propsStudentId || pageStudentId;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {page?.title?.rendered || 'Student Evaluation'}
      </h1>
      
      <StudentEvaluationForm 
        studentId={studentId} 
        evaluationId={evaluationId || Number(page?.evaluationId)} 
      />
    </div>
  );
};

export default EvaluationTemplate;
