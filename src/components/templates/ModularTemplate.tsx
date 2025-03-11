// src/components/templates/ModularTemplate.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { LocalPage, Module } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


export default function ModularTemplate({ page }: ModularTemplateProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Ensure modules is always an array, even if page.modules is undefined
  const modules = Array.isArray(page.modules) ? page.modules : [];

  // For debugging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ModularTemplate rendered with modules:', modules);
    }
  }, [modules]);

  return (
    <TemplateTransitionWrapper>
      {/* Render modules if available */}
      {Array.isArray(modules) && modules.length > 0 ? (
        <>
          {/* Render all modules */}
          {modules.map((module: Module, index: number) => (
            <ModuleRenderer key={module.id || index} module={module} />
          ))}

          {/* Show debug information in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="container mx-auto px-4 py-8 border-t">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Developer Information</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                >
                  {showDebugInfo ? 'Hide' : 'Show'} Debug Info
                </Button>
              </div>

              {showDebugInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h3 className="font-medium mb-2">Page Information</h3>
                  <p>ID: {page.id}</p>
                  <p>Slug: {page.slug}</p>
                  <p>Template: {page.template}</p>

                  <h3 className="font-medium mt-4 mb-2">Modules ({modules.length})</h3>
                  <ul className="space-y-2">
                    {modules.map((module: Module, index: number) => (
                      <li key={index} className="p-2 bg-white rounded border">
                        <div className="flex justify-between">
                          <span className="font-medium">{module.type}</span>
                          <span className="text-sm text-gray-500">ID: {module.id}</span>
                        </div>
                        <p className="text-sm">{module.title || '[No title]'}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Display a message if no modules are available
        <div className="container mx-auto px-4 py-8">
          <Alert variant="warning" className="mb-8">
            <AlertTitle>No modules found</AlertTitle>
            <AlertDescription>
              This page is configured to use the modular template but doesn't have any modules yet.
            </AlertDescription>
          </Alert>

          <h1
            className="text-4xl font-bold mb-6"
            dangerouslySetInnerHTML={{ __html: page.title.rendered }}
          />

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </div>
      )}
    </TemplateTransitionWrapper>
  );
}