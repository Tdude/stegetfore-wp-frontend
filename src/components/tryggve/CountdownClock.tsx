// src/components/tryggve/CountdownClock.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownClockProps {
  className?: string;
}

export default function CountdownClock({ className }: CountdownClockProps) {
  const [rotation, setRotation] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Animate the clock hand rotating backwards (countdown effect)
    const interval = setInterval(() => {
      setRotation((prev) => (prev - 1) % 360); // Move 1 degree per second (backwards)
    }, 500); // Changed from 200ms to 1000ms (1 second)

    return () => clearInterval(interval);
  }, []);

  // Prevent hydration issues by not rendering dynamic content until mounted
  if (!isMounted) {
    return (
      <div className={cn("relative inline-block", className)}>
        <svg width="70" height="70" viewBox="0 0 120 120" className="drop-shadow-lg">
          <circle cx="60" cy="60" r="58" fill="white" stroke="black" strokeWidth="2" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = Math.round((60 + 48 * Math.cos(angle)) * 100) / 100;
            const y1 = Math.round((60 + 48 * Math.sin(angle)) * 100) / 100;
            const x2 = Math.round((60 + 52 * Math.cos(angle)) * 100) / 100;
            const y2 = Math.round((60 + 52 * Math.sin(angle)) * 100) / 100;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="2" strokeLinecap="round" />
            );
          })}
          <circle cx="60" cy="60" r="4" fill="black" />
          <line x1="60" y1="60" x2="60" y2="20" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="60" x2="60" y2="30" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="60" r="3" fill="hsl(var(--primary))" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Clock face */}
      <svg
        width="70"
        height="70"
        viewBox="0 0 120 120"
        className="drop-shadow-lg"
      >
        {/* Outer circle */}
        <circle
          cx="60"
          cy="60"
          r="58"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        
        {/* Hour markers (12 simple lines) */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = Math.round((60 + 48 * Math.cos(angle)) * 100) / 100;
          const y1 = Math.round((60 + 48 * Math.sin(angle)) * 100) / 100;
          const x2 = Math.round((60 + 52 * Math.cos(angle)) * 100) / 100;
          const y2 = Math.round((60 + 52 * Math.sin(angle)) * 100) / 100;
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Center dot */}
        <circle cx="60" cy="60" r="4" fill="black" />

        {/* Minute hand (longer, thinner) - static pointing up */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="20"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Hour hand (shorter, thicker) - animated countdown */}
        <line
          x1="60"
          y1="60"
          x2={Math.round((60 + 30 * Math.sin((rotation * Math.PI) / 180)) * 100) / 100}
          y2={Math.round((60 - 30 * Math.cos((rotation * Math.PI) / 180)) * 100) / 100}
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            transition: 'all 0.3s ease-out',
          }}
        />

        {/* Center dot on top */}
        <circle cx="60" cy="60" r="3" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
}
