// src/components/templates/TemplateTransitionWrapper.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function TemplateTransitionWrapper({
  children,
  className = ""
}: TransitionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}