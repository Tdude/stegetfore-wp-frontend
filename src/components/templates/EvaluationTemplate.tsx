// components/templates/EvaluationTemplate.tsx
'use client';

import React, { useState, useEffect } from 'react';
import StudentEvaluationForm from '@/components/forms/evaluation/StudentEvaluationForm';
import DebugPanel from '@/components/debug/DebugPanel';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';

// Main EvaluationTemplate component
const EvaluationTemplate: React.FC<{ page: any, evaluationId?: number, studentId?: number | string }> = ({ 
  page, 
  evaluationId,
  studentId: propsStudentId
}) => {
  // Extract student ID from page if available
  const pageStudentId = page?.meta?.student_id || page?.studentId;
  const studentId = propsStudentId || pageStudentId;
  
  // Set up content display logic
  const pageTitle = page?.title?.rendered || 'Student Evaluation';
  const pageContent = page?.content?.rendered || '';
  
  // Content positioning logic using new content_display_settings structure
  const contentDisplaySettings = page?.content_display_settings || {
    show_content_with_modules: false,
    content_position: 'before'
  };
  const showContentWithForm = contentDisplaySettings.show_content_with_modules;
  const contentPosition = contentDisplaySettings.content_position || 'before';
  
  // Simplified content display logic
  const shouldShowContentBefore = showContentWithForm && contentPosition === 'before' && pageContent;
  const shouldShowContentAfter = showContentWithForm && contentPosition === 'after' && pageContent;
  const shouldShowContentAlone = (!showContentWithForm) && pageContent;
  
  return (
    <TemplateTransitionWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Page title */}
        <h1 className="text-3xl font-bold mb-6" dangerouslySetInnerHTML={{ __html: pageTitle }} />
        
        {/* Show content before form if configured that way */}
        {shouldShowContentBefore && (
          <div
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mb-8"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}
        
        {/* Show content without form if configured that way */}
        {shouldShowContentAlone && (
          <div
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mb-8"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}
        
        {/* StudentEvaluationForm */}
        <StudentEvaluationForm 
          studentId={studentId} 
          evaluationId={evaluationId || Number(page?.evaluationId)} 
        />
        
        {/* Show content after form if configured that way */}
        {shouldShowContentAfter && (
          <div
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mt-8"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}
        
        {/* Add debug panel at the very bottom - only render if we have a valid page */}
        {page && (
          <DebugPanel 
            title="Evaluation Debug Information"
            page={page}
            additionalData={{
              'Page ID': page.id,
              'Template': page.template || 'Evaluation',
              'Title': pageTitle ? 'Set' : 'Missing',
              'Has Content': Boolean(pageContent),
              'Content Length': pageContent?.length || 0,
              'Show Content With Form': showContentWithForm ? 'Yes' : 'No',
              'Content Position': contentPosition,
              'Student ID': studentId || 'Not set',
              'Evaluation ID': evaluationId || Number(page?.evaluationId) || 'Not set',
              'Content Display': pageContent 
                ? (showContentWithForm 
                    ? `Showing content ${contentPosition} form` 
                    : 'Showing content without form relationship') 
                : 'No content to display',
              'Content Display Settings': JSON.stringify(contentDisplaySettings),
              'Page Meta': page.meta || 'No meta data',
            }}
          />
        )}
      </div>
    </TemplateTransitionWrapper>
  );
};

export default EvaluationTemplate;
