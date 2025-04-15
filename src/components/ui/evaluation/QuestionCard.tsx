// src/components/ui/evaluation/QuestionCard.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question, Option } from '@/lib/types/formTypesEvaluation';
import { questionStageClasses, getOptionClasses } from './styles';

interface QuestionCardProps {
  question: Question;
  questionId: string;
  value: string;
  comment: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  currentIndex: number;
  totalQuestions: number;
}

/**
 * Question Card component for the multi-stage form
 * Displays a single question with options grouped by stage
 */
const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionId,
  value,
  comment,
  onChange,
  onCommentChange,
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

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">{question.text}</CardTitle>
          <div className="text-sm text-gray-500">
            Fråga {currentIndex + 1} av {totalQuestions}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <RadioGroup value={value} onValueChange={handleOptionSelect}>
          {optionsByStage.map(([stage, stageOptions]) => (
            <div key={`${questionId}-${stage}`} className={questionStageClasses[stage as keyof typeof questionStageClasses]}>
              {stageOptions.map((option, index) => (
                <div 
                  key={`${questionId}-${option.value}`} 
                  className={`${getOptionClasses(selectedOption === option.value)} ${index > 0 ? '-mt-[2px]' : ''}`}
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

export default QuestionCard;
