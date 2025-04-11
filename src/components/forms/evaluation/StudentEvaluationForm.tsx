// src/components/forms/evaluation/StudentEvaluationForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { FormData, FormSection, QuestionsStructure, StudentEvaluationFormProps, initialFormState, EvaluationResponse } from '@/lib/types/formTypesEvaluation';
import { evaluationApi, authApi } from '@/lib/api/formTryggveApi';
import StepByStepView from './StepByStepView';
import FullFormView from './FullFormView';
import LoadingDots, { LoadingSpinner } from '@/components/ui/LoadingDots';

/**
 * Student Evaluation Form component
 * Main component for handling evaluation form state and logic
 */
const StudentEvaluationForm: React.FC<StudentEvaluationFormProps> = ({ 
  studentId: initialStudentId, 
  evaluationId 
}) => {
  // State for form data and UI
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [questionsStructure, setQuestionsStructure] = useState<QuestionsStructure>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<keyof FormData>('anknytning');
  const [fadeState, setFadeState] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');
  const [disableAutoAdvance, setDisableAutoAdvance] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(
    initialStudentId !== undefined 
      ? (typeof initialStudentId === 'string' 
          ? parseInt(initialStudentId, 10) || null 
          : initialStudentId) 
      : null
  );
  
  // Auto-advance timeout ref
  const autoAdvanceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch questions structure on mount
  useEffect(() => {
    const fetchQuestionsStructure = async () => {
      try {
        const structure = await evaluationApi.getQuestionsStructure();
        setQuestionsStructure(structure);
        setIsLoading(false);
      } catch (error) {
        toast.error('Misslyckades med att ladda in frågeställningarna');
        setIsLoading(false);
      }
    };

    fetchQuestionsStructure();
  }, []);

  // Fetch current user info if no studentId is provided
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Skip if studentId is already set from props
      if (studentId !== null) return;
      
      try {
        // Try to get current user from HAM plugin
        const userInfo = await authApi.getCurrentUser();
        
        if (userInfo && userInfo.student_id) {
          // If we have a student ID from HAM, use it
          setStudentId(userInfo.student_id);
        } else if (userInfo && userInfo.id) {
          // Fallback to using the WordPress user ID
          setStudentId(userInfo.id);
        } else {
          console.warn('No student ID or user ID found in current user info');
          // Fallback to a default student ID for development purposes. WP Admin should always be able to save.
          setStudentId(1); // Use ID 1 as a fallback (usually the admin user)
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Fallback to a default student ID for development purposes
        setStudentId(1); // Use ID 1 as a fallback (usually the admin user)
      }
    };

    fetchCurrentUser();
  }, [studentId]);

  // Fetch existing evaluation data if evaluationId is provided
  useEffect(() => {
    const fetchEvaluationData = async () => {
      if (evaluationId) {
        try {
          setIsLoading(true);
          const evaluationData = await evaluationApi.getEvaluation(evaluationId);
          
          if (evaluationData) {
            setFormData(evaluationData.formData);
            setStudentId(evaluationData.studentId);
          }
        } catch (error) {
          toast.error('Misslyckades med att ladda in utvärderingen');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEvaluationData();
  }, [evaluationId]);

  // Create a flat list of all questions for step-by-step navigation
  const allQuestions = useMemo(() => {
    const questions: Array<{
      sectionId: keyof FormData;
      questionId: string;
      question: any;
    }> = [];

    Object.entries(questionsStructure).forEach(([sectionId, section]) => {
      // Process questions directly in the section
      if (section.questions) {
        Object.entries(section.questions).forEach(([questionId, question]) => {
          questions.push({
            sectionId: sectionId as keyof FormData,
            questionId,
            question
          });
        });
      }
      
      // Process questions in subsections
      if (section.subsections) {
        Object.entries(section.subsections).forEach(([subsectionId, subsection]) => {
          if (subsection.questions) {
            Object.entries(subsection.questions).forEach(([questionId, question]) => {
              questions.push({
                sectionId: sectionId as keyof FormData,
                questionId,
                question
              });
            });
          }
        });
      }
    });

    return questions;
  }, [questionsStructure]);

  // Get current question based on index
  const currentQuestion = useMemo(() => {
    return allQuestions[currentQuestionIndex] || null;
  }, [allQuestions, currentQuestionIndex]);

  // Handle going to previous question
  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      // Start transition
      setFadeState('fading-out');
      
      // Actual navigation happens after the transition
      setTimeout(() => {
        setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        setFadeState('fading-in');
        
        // Reset visibility
        setTimeout(() => {
          setFadeState('visible');
        }, 300);
      }, 300);
    }
  }, [currentQuestionIndex]);

  // Handle going to next question
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      // Start transition
      setFadeState('fading-out');
      
      // Actual navigation happens after the transition
      setTimeout(() => {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setFadeState('fading-in');
        
        // Reset visibility
        setTimeout(() => {
          setFadeState('visible');
        }, 300);
      }, 300);
    }
  }, [currentQuestionIndex, allQuestions.length]);

  // Handle question changes in full form view
  const handleQuestionChange = useCallback((sectionId: keyof FormData, questionId: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        questions: {
          ...prev[sectionId]?.questions,
          [questionId]: value
        }
      }
    }));
  }, []);

  // Handle comment changes
  const handleCommentChange = useCallback((sectionId: keyof FormData, questionId: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        comments: {
          ...prev[sectionId]?.comments,
          [questionId]: value || undefined // Don't save empty comments
        }
      }
    }));
  }, []);

  // Calculate progress percentage for a specific question
  const calculateProgress = useCallback((sectionId: keyof FormData, questionId: string) => {
    const answer = formData[sectionId]?.questions?.[questionId];
    
    if (!answer) return 0;
    
    return parseInt(answer, 10) / 5; // Convert 1-5 scale to 0-1 percentage
  }, [formData]);

  // Calculate overall progress for a section
  const calculateSectionProgress = useCallback((sectionId: keyof FormData) => {
    const section = questionsStructure[sectionId];
    if (!section) return 0;
    
    let totalQuestions = 0;
    let progressSum = 0;
    
    // Process questions directly in the section
    if (section.questions) {
      Object.keys(section.questions).forEach(questionId => {
        totalQuestions++;
        // Add the progress value (will be 0 if not answered)
        progressSum += calculateProgress(sectionId, questionId);
      });
    }
    
    // Process questions in subsections
    if (section.subsections) {
      Object.values(section.subsections).forEach(subsection => {
        if (subsection.questions) {
          Object.keys(subsection.questions).forEach(questionId => {
            totalQuestions++;
            // Add the progress value (will be 0 if not answered)
            progressSum += calculateProgress(sectionId, questionId);
          });
        }
      });
    }
    
    // Return the total progress divided by the total number of questions
    return totalQuestions > 0 ? progressSum / totalQuestions : 0;
  }, [formData, questionsStructure, calculateProgress]);

  // Toggle between full form and step-by-step views
  const toggleFullForm = useCallback(() => {
    setShowFullForm(prev => !prev);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have a student ID
    if (!studentId) {
      try {
        const userInfo = await authApi.getCurrentUser();
        
        if (userInfo && userInfo.student_id) {
          setStudentId(userInfo.student_id);
        } else if (userInfo && userInfo.id) {
          setStudentId(userInfo.id);
        } else {
          console.warn('Using default student ID (1) for development');
          setStudentId(1);
        }
      } catch (error) {
        console.warn('Using default student ID (1) for development');
        setStudentId(1);
      }
    }
    
    setIsSaving(true);
    
    try {
      // Include the evaluation ID if we're updating an existing evaluation
      const evaluationData = {
        ...(evaluationId ? { id: evaluationId } : {}),
        anknytning: formData.anknytning,
        ansvar: formData.ansvar
      };
      
      // Log the data being sent to help with debugging
      console.log('Sending evaluation data:', evaluationData);
      console.log('Student ID:', studentId);
      
      // ALWAYS send to backend in Docker environment, regardless of NODE_ENV
      // This ensures data is properly saved to WordPress
      const result = await evaluationApi.saveEvaluation(studentId!, evaluationData);
      console.log('API response:', result);
      
      // Also save to localStorage for development persistence if in dev mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        const mockId = evaluationId || Date.now();
        console.log('DEV MODE: Also saving locally with ID:', mockId);
        
        localStorage.setItem(`evaluation_${mockId}`, JSON.stringify({
          id: mockId,
          studentId,
          formData: evaluationData,
          updatedAt: new Date().toISOString()
        }));
      }
      
      toast.success('Evaluation saved successfully');
    } catch (error) {
      toast.error('Failed to save evaluation');
      console.error('Error saving evaluation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle question change in step-by-step view
  const handleStepByStepQuestionChange = useCallback((sectionId: keyof FormData, questionId: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        questions: {
          ...prev[sectionId]?.questions,
          [questionId]: value
        }
      }
    }));
    
    // Auto-advance to next question after a short delay if not disabled
    if (!disableAutoAdvance && currentQuestionIndex < allQuestions.length - 1) {
      // Clear any existing timeout
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      
      // Set a new timeout to auto-advance
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        handleNextQuestion();
      }, 1000); // Wait 1 second before advancing
    }
  }, [currentQuestionIndex, allQuestions.length, disableAutoAdvance, handleNextQuestion]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <LoadingDots text="Laddar utvärderingsformulär" />
      </div>
    );
  }

  // Show appropriate view based on showFullForm state
  return (
    <div className="form-container">
      {showFullForm ? (
        <FullFormView
          formData={formData}
          questionsStructure={questionsStructure}
          toggleFullForm={toggleFullForm}
          handleQuestionChange={handleQuestionChange}
          handleCommentChange={handleCommentChange}
          calculateProgress={calculateSectionProgress}
          calculateSectionProgress={calculateSectionProgress}
          isSaving={isSaving}
          handleSubmit={handleSubmit}
          evaluationId={evaluationId}
        />
      ) : (
        <StepByStepView
          formData={formData}
          questionsStructure={questionsStructure}
          allQuestions={allQuestions}
          currentQuestionIndex={currentQuestionIndex}
          currentSection={currentSection}
          fadeState={fadeState}
          handlePrevQuestion={handlePrevQuestion}
          handleNextQuestion={handleNextQuestion}
          toggleFullForm={toggleFullForm}
          handleStepByStepQuestionChange={handleStepByStepQuestionChange}
          handleCommentChange={handleCommentChange}
          calculateProgress={calculateProgress}
          isSaving={isSaving}
          handleSubmit={handleSubmit}
          evaluationId={evaluationId}
        />
      )}
    </div>
  );
};

export default StudentEvaluationForm;
