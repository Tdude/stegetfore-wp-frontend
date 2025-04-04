'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
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
  ej: 'border-l-4 border-red-200 pl-4',
  trans: 'border-l-4 border-amber-200 pl-4',
  full: 'border-l-4 border-green-200 pl-4'
};

// Progress Bar component
const ProgressBar: React.FC<ProgressBarProps> = ({ value, type, stage }) => {
  const baseClasses = "h-2 rounded-full transition-all duration-300";
  const typeClasses = type === 'section' ? 'h-1' : 'h-6';

  const getProgressColor = (value: number, stage?: 'ej' | 'trans' | 'full') => {
    if (type === 'total' && stage === 'ej') return 'bg-red-500';
    if (value < 33) return 'bg-red-500';
    if (value < 66) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full">
      <div
        className={`${baseClasses} ${typeClasses} ${getProgressColor(value, stage)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

// SubSection component
const SubSection: React.FC<SubSectionProps> = ({
  title,
  questionId,
  options,
  value,
  onChange,
  onCommentChange,
  comment,
  sectionId,
  calculateProgress
}) => {
  const progress = calculateProgress(sectionId, questionId);

  // Group options by stage
  const groupedOptions = options.reduce((acc, opt) => {
    if (!acc[opt.stage]) acc[opt.stage] = [];
    acc[opt.stage].push(opt);
    return acc;
  }, {} as Record<string, Option[]>);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ProgressBar value={progress} type="section" />

      <RadioGroup value={value} onValueChange={onChange} className="mt-4">
        {Object.entries(groupedOptions).map(([stage, stageOptions]) => (
          <div key={stage} className={stageClasses[stage as keyof typeof stageClasses]}>
            {stageOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <RadioGroupItem value={option.value} id={`${questionId}-${option.value}`} />
                <Label
                  htmlFor={`${questionId}-${option.value}`}
                  className="text-sm cursor-pointer hover:bg-gray-50 rounded p-2 flex-1"
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
        placeholder={`Kommentar om ${title.toLowerCase()}...`}
        className="mt-4"
      />
    </div>
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
const StudentEvaluationForm: React.FC<StudentEvaluationFormProps> = ({ studentId, evaluationId }) => {
  const [questionsStructure, setQuestionsStructure] = useState<QuestionsStructure | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          setFormData(evalData.formData);

          toast.success('Utvärdering laddad');
        } else {
          // Initialize form data with empty values for all questions
          const newFormData: FormData = {
            anknytning: {
              questions: {},
              comments: {}
            },
            ansvar: {
              questions: {},
              comments: {}
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
  }, [evaluationId]);

  // For form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const loadingToast = toast.loading('Sparar utvärdering...');

    try {
      // Transform form data to match backend structure
      const transformedData = {
        ...(evaluationId ? { id: evaluationId } : {}),
        student_id: studentId,
        title: `Utvärdering för ${studentId}`,  // Add a default title
        formData: {
          anknytning: {
            questions: formData.anknytning.questions,
            comments: formData.anknytning.comments
          },
          ansvar: {
            questions: formData.ansvar.questions,
            comments: formData.ansvar.comments
          }
        }
      } as EvaluationResponse;

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

  // For handling question value changes
  const handleQuestionChange = (sectionId: keyof FormData, questionId: string) => (value: string) => {
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
  };

  // For handling comment changes
  const handleCommentChange = (sectionId: keyof FormData, questionId: string) => (value: string) => {
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
  };

  // Calculate progress for a specific question
  const calculateProgress = (sectionId: keyof FormData, questionId: string): number => {
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
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Laddar utvärderingsformulär...</div>;
  }

  if (!questionsStructure) {
    return <div className="flex justify-center p-8">Kunde inte ladda frågestrukturen.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 p-6">
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
                      <SubSection
                        key={questionId}
                        title={section.questions[questionId].text}
                        questionId={questionId}
                        options={section.questions[questionId].options}
                        value={formData[sectionId as keyof FormData]?.questions?.[questionId] || ''}
                        onChange={handleQuestionChange(sectionId as keyof FormData, questionId)}
                        onCommentChange={handleCommentChange(sectionId as keyof FormData, questionId)}
                        comment={formData[sectionId as keyof FormData]?.comments?.[questionId] || ''}
                        sectionId={sectionId as keyof FormData}
                        calculateProgress={calculateProgress}
                      />
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
              <ProgressBar
                value={calculateProgress(sectionId as keyof FormData, Object.keys(section.questions)[0])}
                type="total"
                stage={(() => {
                  const value = calculateProgress(sectionId as keyof FormData, Object.keys(section.questions)[0]);
                  if (value < 33) return 'ej';
                  if (value < 66) return 'trans';
                  return 'full';
                })()}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button
          type="submit"
          className="px-8 py-2 text-lg"
          disabled={isSaving}
        >
          {isSaving ? 'Sparar...' : evaluationId ? 'Uppdatera utvärdering' : 'Spara utvärdering'}
        </Button>
      </div>
    </form>
  );
};

export default StudentEvaluationForm;
