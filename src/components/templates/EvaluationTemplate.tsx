// components/templates/EvaluationTemplate.tsx
'use client';

import React from 'react';
import StudentEvaluationForm from '@/components/forms/evaluation/StudentEvaluationForm';
import { LocalPage } from '@/lib/types';

interface EvaluationPageType extends Omit<LocalPage, 'evaluationId'> {
  meta?: {
    student_id?: number | string;
  };
  studentId?: number | string;
  evaluationId?: number | string;
}

// Main EvaluationTemplate component
const EvaluationTemplate: React.FC<{ 
  page: EvaluationPageType, 
  evaluationId?: number, 
  studentId?: number | string 
}> = ({ 
  page, 
  evaluationId,
  studentId: propsStudentId
}) => {
  // Extract student ID from page if available
  const pageStudentId = page?.meta?.student_id || page?.studentId;
  const studentId = propsStudentId || pageStudentId;
  
  // Convert evaluationId to number if it exists
  const evalId = evaluationId || (page?.evaluationId ? Number(page.evaluationId) : undefined);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {page?.title?.rendered || 'Student Evaluation'}
      </h1>
      
      <StudentEvaluationForm 
        studentId={studentId} 
        evaluationId={evalId} 
      />
    </div>
  );
};

export default EvaluationTemplate;
