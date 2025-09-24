// src/components/forms/evaluation/StudentEvaluationForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  FormData,
  QuestionsStructure,
  StudentEvaluationFormProps,
  initialFormState,
  Question
} from '@/lib/types/formTypesEvaluation';
import { evaluationApi, authApi } from '@/lib/api/formTryggveApi';
import LoadingDots from '@/components/ui/LoadingDots';
import StepByStepView from './StepByStepView';
import FullFormView from './FullFormView';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/auth/LoginButton';
import { launchConfetti } from '@/lib/utils/confetti';
import CenteredToast from '@/components/CenteredToast';
import StudentSearch from './StudentSearch';

/**
 * Student Evaluation Form component
 * Main component for handling evaluation form state and logic
 */
const StudentEvaluationForm: React.FC<StudentEvaluationFormProps> = ({
  studentId: initialStudentId,
  evaluationId
}) => {
  // Auth check - MUST be called before any other hooks or conditionals
  const { isAuthenticated, loading, userInfo } = useAuth();

  // State for form data and UI (always call hooks at the top, before any return)
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
    initialStudentId ? (typeof initialStudentId === 'string' ? parseInt(initialStudentId, 10) : initialStudentId) : null
  );
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [centeredToastOpen, setCenteredToastOpen] = useState(false);
  const [showSearch, setShowSearch] = useState<boolean>(true); // Controls if student search is shown

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
          const studentId = typeof userInfo.student_id === 'string' ? parseInt(userInfo.student_id, 10) : userInfo.student_id;
          setStudentId(studentId as number);
        } else if (userInfo && userInfo.id) {
          // Fallback to using the WordPress user ID
          const userId = typeof userInfo.id === 'string' ? parseInt(userInfo.id, 10) : userInfo.id;
          setStudentId(userId as number);
        } else {
          console.warn('No student ID or user ID found in current user info');
          // Don't set a default ID when using student search
          // The teacher will need to select a student
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Don't set a default ID when using student search
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

  // NOTE: We no longer need to fetch student details separately
  // The student details are now provided directly from the StudentSearch component

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
      question: Question; // Using the proper Question type
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
      setCenteredToastOpen(true);

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

  // Show loading state for initial load
  if (loading) {
    return <LoadingDots text="Laddar" />;
  }

  // Handle authentication
  if (!isAuthenticated && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-xl bg-muted/30 border border-muted-foreground/10 shadow-md px-6 py-8 max-w-lg w-full text-center">
          <span role="img" aria-label="Padlock" className="text-4xl mb-2">🔒</span>
          <div className="mt-3 font-semibold text-lg text-foreground">
            Du måste vara inloggad för att se det här innehållet.
          </div>
          <div className="m-2 text-secondary text-base">
            <LoginButton
              onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-login-modal'))}
              className="my-8 mx-auto"
            />
            {" Kontakta "}
            <a href="mailto:admin@stegetfore.se" className="font-bold hover:text-primary/80">administratören</a>
            {" om du behöver hjälp."}
          </div>
        </div>
      </div>
    );
  }
  //   h-full bg-card text-card-foreground w-full max-w-3xl mx-auto 
  // Always render teacher and student information at the top of the form
  const renderStudentSelection = () => {
    // Don't render when loading (fixes 'isLoading not found' error)
    if (loading) return null;

    return (
      <div className="mb-8 mt-8 w-full max-w-3xl mx-auto">
        <h2 className="text-xl font-medium mb-4 text-foreground">
          {!studentId ? 'Välj en elev för att starta bedömningen' : 'Bedömning'}
        </h2>
        <div className="flex flex-wrap justify-between items-center mb-4">

          {userInfo && userInfo.display_name && (
            <div className="badge-teacher inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
              <span>Lärare: <strong>{userInfo.display_name}</strong></span>
            </div>
          )}
          {studentName && (
            <div className="badge-student inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Elev: <strong>{studentName}</strong></span>
            </div>
          )}
          {studentClass && (
            <div className="badge-class inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>Klass: <strong>{studentClass}</strong></span>
            </div>
          )}
          <button
            onClick={() => setShowSearch(true)}
            className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-surface-tertiary text-gray-600 dark:text-text-secondary py-1.5 px-3 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-surface-secondary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
            Byt elev
          </button>
        </div>

        {showSearch ? (
          // Full search interface when no student is selected or search is shown
          <StudentSearch
            onStudentSelect={(selectedStudent) => {
              // Set student ID and data from the search component
              setStudentId(selectedStudent.id);
              setStudentName(selectedStudent.name);

              // Use class information directly from the search results
              // The backend now includes this information for each student
              setStudentClass(selectedStudent.className || 'Information om klass saknas');

              // Log the selected student information for debugging
              console.log('Selected student:', {
                id: selectedStudent.id,
                name: selectedStudent.name,
                classId: selectedStudent.classId,
                className: selectedStudent.className
              });

              setShowSearch(false);
              toast.success('Elev vald');
            }}
            selectedStudentId={studentId}
            className="mb-4"
          />
        ) : (
          // Just a spacer when student is already selected
          <div className="mb-4"></div>
        )}
      </div>
    );
  }

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
    <>
      <div className="form-container">
        {renderStudentSelection()}
        {!showFullForm ? (
          <StepByStepView
            formData={formData}
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
      <CenteredToast
        message="Utvärderingen har sparats"
        open={centeredToastOpen}
        onClose={() => setCenteredToastOpen(false)}
      />
    </>
  );
};

export default StudentEvaluationForm;
