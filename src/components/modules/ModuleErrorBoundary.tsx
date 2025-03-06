// src/components/modules/ModuleErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  type: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error(`Error rendering ${this.props.type} module:`, error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI when a module fails to render
      return (
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <h3 className="font-medium text-red-800">
            Error in {this.props.type} module
          </h3>
          <p className="mt-2 text-red-700">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <details className="mt-3">
            <summary className="text-sm text-red-600 cursor-pointer">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-red-500 overflow-auto p-2 bg-red-50 border border-red-100 rounded">
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </details>
          <button
            className="mt-4 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-100"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ModuleErrorBoundary;