// src/components/forms/evaluation/StudentEvaluationForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { FormData, QuestionsStructure, StudentEvaluationFormProps, initialFormState } from '@/lib/types/formTypesEvaluation';
import { evaluationApi, authApi } from '@/lib/api/formTryggveApi';
import LoadingDots from '@/components/ui/LoadingDots';
import StepByStepView from './StepByStepView';
import FullFormView from './FullFormView';
import confetti from 'canvas-confetti';

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
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');
  const [localStorageKey, setLocalStorageKey] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<number | null>(
    initialStudentId !== undefined 
      ? (typeof initialStudentId === 'string' 
          ? parseInt(initialStudentId, 10) || null 
          : initialStudentId) 
      : null
  );
  
  // Auto-advance timeout ref
  const autoAdvanceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch question structure on mount, using the same robust approach as before
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Get the question structure - this might include admin template or user data
        const questionStructure = await evaluationApi.getQuestionsStructure();
        console.log('Question structure loaded');
        
        // 2. Handle whatever comes back - we don't care if it's admin or user data
        //    We just need the structure for rendering the form UI
        setQuestionsStructure(questionStructure);
        
        // 3. CRITICAL: Always use a clean form state for the answers
        //    This ensures we never show previous answers, just the question structure
        setFormData(initialFormState);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading question structure:', error);
        toast.error('Misslyckades med att ladda in frågeställningarna');
        setIsLoading(false);
      }
    };

    fetchData();
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

  // Set up the local storage key without loading any draft data
  useEffect(() => {
    if (studentId) {
      // We're still setting up the key for saving, but we won't load anything from it
      const key = `evaluation_draft_${studentId}_${new Date().toISOString().split('T')[0]}`;
      setLocalStorageKey(key);
      console.log('Set up localStorage key for saving:', key);
    }
  }, [studentId]);

  // Auto-save to localStorage every 30 seconds if form has changes
  // We'll keep this so users don't lose work, but we never load from localStorage on startup
  useEffect(() => {
    if (!localStorageKey || !studentId || typeof window === 'undefined') return;
    
    const saveInterval = setInterval(() => {
      // Only save if the form is different from initialFormState
      if (JSON.stringify(formData) !== JSON.stringify(initialFormState)) {
        localStorage.setItem(localStorageKey, JSON.stringify({
          studentId,
          formData,
          updatedAt: new Date().toISOString()
        }));
        console.log('Auto-saved form draft to localStorage');
      }
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [formData, localStorageKey, studentId]);

  // Create a flat list of all questions for step-by-step navigation
  const allQuestions = useMemo(() => {
    const questions: Array<{
      sectionId: keyof FormData;
      questionId: string;
      question: unknown;
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
        Object.values(section.subsections).forEach(subsection => {
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
  // Removed unused variable currentQuestion

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
  }, [calculateProgress, questionsStructure]);

  // Toggle between full form and step-by-step views
  const toggleFullForm = useCallback(() => {
    setShowFullForm(prev => !prev);
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!studentId) {
        toast.error('Student ID saknas');
        return;
      }
      
      // Add form validation - don't submit empty forms
      const anknytningAnswered = Object.keys(formData.anknytning?.questions || {}).length > 0;
      const ansvarAnswered = Object.keys(formData.ansvar?.questions || {}).length > 0;
      
      console.log('Form submission - Questions answered:', {
        anknytning: anknytningAnswered ? Object.keys(formData.anknytning?.questions || {}).length : 0,
        ansvar: ansvarAnswered ? Object.keys(formData.ansvar?.questions || {}).length : 0,
        formData: formData
      });
      
      if (!anknytningAnswered && !ansvarAnswered) {
        toast.error('Du behöver besvara minst en fråga innan du kan skicka in formuläret');
        return;
      }
      
      setIsSaving(true);
      
      // Cast formData to Record<string, unknown> to satisfy TypeScript
      const response = await evaluationApi.saveEvaluation(
        studentId,
        formData as unknown as Record<string, unknown>
      );
      
      // Log the complete response for debugging
      console.log('Save evaluation complete response:', JSON.stringify(response, null, 2));
      
      // Check if the response indicates success
      if (!response || response.success === false) {
        const errorMessage = response?.error?.message || 'Ett fel uppstod vid sparande';
        console.error('API returned error:', response?.error);
        toast.error(errorMessage);
        setIsSaving(false);
        return;
      }
      
      // Clear the local storage draft if we have a key
      if (localStorageKey) {
        localStorage.removeItem(localStorageKey);
      }
      
      // Success - show toast and confetti celebration
      toast.success('Utvärderingen har sparats');
      
      // Trigger confetti celebration
      launchConfetti();
      
      setIsFormSaved(true);
      
      // Check for evaluation ID safely in the response structure
      // The API response might have the ID in data.id, or it might be on response.data.evaluation_id
      const responseData = response?.data || {};
      const evaluationId = responseData.id || responseData.evaluation_id;
      
      if (evaluationId && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('evaluationId', String(evaluationId));
        window.history.replaceState({}, '', url.toString());
      }
      
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast.error('Något gick fel vid sparande av utvärderingen');
      setIsSaving(false);
    }
  };

  // Confetti celebration function
  const launchConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FF4500', '#00BFFF', '#7CFC00', '#DA70D6'], // Gold, orange, blue, green, purple
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FF4500', '#00BFFF', '#7CFC00', '#DA70D6'],
      });
    }, 250);
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
    if (currentQuestionIndex < allQuestions.length - 1) {
      // Clear any existing timeout
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      
      // Set a new timeout to auto-advance
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        handleNextQuestion();
      }, 1000); // Wait 1 second before advancing
    }
  }, [currentQuestionIndex, allQuestions.length, handleNextQuestion]);

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
      {!showFullForm ? (
        <StepByStepView 
          formData={formData}
          questionsStructure={questionsStructure}
          allQuestions={allQuestions}
          currentQuestionIndex={currentQuestionIndex}
          currentSection={allQuestions[currentQuestionIndex]?.sectionId}
          fadeState={fadeState}
          handlePrevQuestion={handlePrevQuestion}
          handleNextQuestion={handleNextQuestion}
          toggleFullForm={toggleFullForm}
          handleStepByStepQuestionChange={handleStepByStepQuestionChange}
          handleCommentChange={handleCommentChange}
          calculateProgress={calculateProgress}
          calculateSectionProgress={calculateSectionProgress}
          isSaving={isSaving}
          handleSubmit={handleSubmit}
          evaluationId={evaluationId}
          isFormSaved={isFormSaved}
        />
      ) : (
        <FullFormView
          formData={formData}
          questionsStructure={questionsStructure}
          toggleFullForm={toggleFullForm}
          handleQuestionChange={handleQuestionChange}
          handleCommentChange={handleCommentChange}
          calculateSectionProgress={calculateSectionProgress}
          isSaving={isSaving}
          handleSubmit={handleSubmit}
          evaluationId={evaluationId}
          isFormSaved={isFormSaved}
        />
      )}
    </div>
  );
};

export default StudentEvaluationForm;
