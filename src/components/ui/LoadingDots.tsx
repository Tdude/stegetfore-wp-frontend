'use client';

import React, { useEffect, useState } from 'react';

interface LoadingDotsProps {
  text?: string;
  className?: string;
  dotsClassName?: string;
}

/**
 * LoadingDots component
 * Displays animated loading dots (ellipsis) after text
 * 
 * @example
 * <LoadingDots text="Loading" />
 * <LoadingDots text="Laddar utvärderingsformulär" />
 */
const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  text = 'Loading', 
  className = '',
  dotsClassName = 'text-primary'
}) => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        switch (prevDots) {
          case '':
            return '.';
          case '.':
            return '..';
          case '..':
            return '...';
          case '...':
            return '';
          default:
            return '';
        }
      });
    }, 500); // Change dots every 500ms
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className={className}>
      {text}<span className={dotsClassName}>{dots}</span>
    </span>
  );
};

/**
 * LoadingSpinner component
 * Displays a spinning loader with optional text and animated dots
 */
export const LoadingSpinner: React.FC<LoadingDotsProps> = ({
  text,
  className = '',
  dotsClassName = ''
}) => {
  return (
    <div className={`py-8 text-center ${className}`}>
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      {text && (
        <p className="mt-4">
          <LoadingDots text={text} dotsClassName={dotsClassName} />
        </p>
      )}
    </div>
  );
};

export default LoadingDots;
