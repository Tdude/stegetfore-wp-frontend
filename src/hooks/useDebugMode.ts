/**
 * Custom hook for handling debug functionality
 * Centralizes debug-related logic for reuse across the application
 */

import { useState, useEffect } from 'react';
import { DebugMode } from '@/lib/types/hookTypes';

/**
 * Hook to manage debug mode functionality
 * @param data Any data to be displayed in the debug panel
 * @returns Object containing debug status and processed data
 */
export function useDebugMode(data: any): DebugMode {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    // Check for debug mode on client side
    setIsEnabled(process.env.NEXT_PUBLIC_DEBUG_MODE === 'true');
  }, []);

  return {
    isEnabled,
    pageData: data
  };
}
