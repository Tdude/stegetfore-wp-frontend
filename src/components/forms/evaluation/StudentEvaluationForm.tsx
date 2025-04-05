// src/components/forms/evaluation/StudentEvaluationForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { FormData, FormSection, QuestionsStructure, StudentEvaluationFormProps, initialFormState, EvaluationResponse } from '@/lib/types/formTypesEvaluation';
import { evaluationApi, authApi } from '@/lib/api/formTryggveApi';
import StepByStepView from './StepByStepView';
import FullFormView from './FullFormView';

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
        toast.error('Failed to load questions structure');
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
          toast.error('Failed to load evaluation data');
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

  // Handle navigation between questions
  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      // Disable auto-advance when going back
      setDisableAutoAdvance(true);
      
      // Start fade out animation
      setFadeState('fading-out');
      
      // After fade out completes, update index and start fade in
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        setFadeState('fading-in');
        
        // After a brief moment, complete the fade in
        setTimeout(() => {
          setFadeState('visible');
        }, 50);
      }, 500); // Match this with the CSS transition duration
    }
  }, [currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      // Re-enable auto-advance when manually going forward
      setDisableAutoAdvance(false);
      
      // Start fade out animation
      setFadeState('fading-out');
      
      // After fade out completes, update index and start fade in
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setFadeState('fading-in');
        
        // After a brief moment, complete the fade in
        setTimeout(() => {
          setFadeState('visible');
        }, 50);
      }, 500); // Match this with the CSS transition duration
    }
  }, [currentQuestionIndex, allQuestions.length]);

  // Auto-advance to next question after selection
  useEffect(() => {
    // Clear any existing timeout
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    // Don't auto-advance if we're showing the full form
    if (showFullForm) return;
    
    // Don't auto-advance if it's been disabled (after clicking Previous)
    if (disableAutoAdvance) return;
    
    // Get current question data
    const currentQuestionData = allQuestions[currentQuestionIndex];
    if (!currentQuestionData) return;
    
    // Check if current question has been answered
    const { sectionId, questionId } = currentQuestionData;
    const isAnswered = !!formData[sectionId]?.questions?.[questionId];
    
    // If answered and not the last question, auto-advance after a delay
    if (isAnswered && currentQuestionIndex < allQuestions.length - 1) {
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        handleNextQuestion();
      }, 800); // Delay before auto-advancing
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [formData, currentQuestionIndex, allQuestions, handleNextQuestion, showFullForm, disableAutoAdvance]);

  // Toggle between full form and step-by-step views
  const toggleFullForm = useCallback(() => {
    setShowFullForm(prev => !prev);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId) {
      // If still no studentId, try to get it one more time
      try {
        const userInfo = await authApi.getCurrentUser();
        
        if (userInfo && userInfo.student_id) {
          setStudentId(userInfo.student_id);
        } else if (userInfo && userInfo.id) {
          setStudentId(userInfo.id);
        } else {
          // Use a default student ID for development purposes
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
      const evaluationData = {
        anknytning: formData.anknytning,
        ansvar: formData.ansvar
      };
      
      // Development mode: Check if we're in development and save locally
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (evaluationId) {
        // Update existing evaluation
        if (isDevelopment) {
          // In development, mock the API call
          console.log('DEV MODE: Would update evaluation with ID:', evaluationId);
          console.log('DEV MODE: Student ID:', studentId);
          console.log('DEV MODE: Form data:', evaluationData);
          
          // Save to localStorage for development persistence
          localStorage.setItem(`evaluation_${evaluationId}`, JSON.stringify({
            id: evaluationId,
            studentId,
            formData: evaluationData,
            updatedAt: new Date().toISOString()
          }));
          
          toast.success('Evaluation updated successfully (Development Mode)');
        } else {
          // Production mode - use the real API
          await evaluationApi.saveEvaluation(studentId!, evaluationData);
          toast.success('Evaluation updated successfully');
        }
      } else {
        // Create new evaluation
        if (isDevelopment) {
          // In development, mock the API call
          const mockId = Date.now(); // Use timestamp as mock ID
          console.log('DEV MODE: Would create new evaluation with mock ID:', mockId);
          console.log('DEV MODE: Student ID:', studentId);
          console.log('DEV MODE: Form data:', evaluationData);
          
          // Save to localStorage for development persistence
          localStorage.setItem(`evaluation_${mockId}`, JSON.stringify({
            id: mockId,
            studentId,
            formData: evaluationData,
            createdAt: new Date().toISOString()
          }));
          
          toast.success('Evaluation saved successfully (Development Mode)');
        } else {
          // Production mode - use the real API
          const newEvaluationId = await evaluationApi.saveEvaluation(studentId!, evaluationData);
          toast.success('Evaluation saved successfully');
        }
      }
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
  }, []);

  // Handle question change in full form view
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

  // Handle comment change in both views
  const handleCommentChange = useCallback((sectionId: keyof FormData, questionId: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        comments: {
          ...prev[sectionId]?.comments,
          [questionId]: value
        }
      }
    }));
  }, []);

  // Calculate progress for a specific question
  const calculateProgress = useCallback((sectionId: keyof FormData, questionId: string): number => {
    const answer = formData[sectionId]?.questions?.[questionId];
    if (!answer) return 0;
    
    // Find the question to get its options
    let question: any = null;
    
    // Look in direct section questions
    if (questionsStructure[sectionId]?.questions?.[questionId]) {
      question = questionsStructure[sectionId].questions[questionId];
    } 
    // Look in subsections
    else if (questionsStructure[sectionId]?.subsections) {
      for (const subsection of Object.values(questionsStructure[sectionId].subsections || {})) {
        if (subsection.questions?.[questionId]) {
          question = subsection.questions[questionId];
          break;
        }
      }
    }
    
    if (!question || !question.options) return 50; // Default to 50% if we can't find the question
    
    // Find the selected option
    const selectedOption = question.options.find((opt: any) => opt.value === answer);
    if (!selectedOption) return 50; // Default to 50% if we can't find the option
    
    // Calculate progress based on the stage
    switch (selectedOption.stage) {
      case 'ej':
        return 33;
      case 'trans':
        return 66;
      case 'full':
        return 100;
      default:
        return 50;
    }
  }, [formData, questionsStructure]);

  // Calculate progress for a section
  const calculateSectionProgress = useCallback((sectionId: keyof FormData): number => {
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

  // Show loading state
  if (isLoading) {
    return <div className="text-center py-8">Loading evaluation form...</div>;
  }

  // Show appropriate view based on showFullForm state
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto py-8">
      {showFullForm ? (
        <FullFormView
          formData={formData}
          questionsStructure={questionsStructure}
          toggleFullForm={toggleFullForm}
          handleQuestionChange={handleQuestionChange}
          handleCommentChange={handleCommentChange}
          calculateProgress={calculateProgress}
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
    </form>
  );
};

export default StudentEvaluationForm;
