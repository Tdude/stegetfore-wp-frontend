// components/templates/EvaluationTemplate.tsx
'use client';

import React from 'react';
import StudentEvaluationForm from '@/components/forms/evaluation/StudentEvaluationForm';

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
