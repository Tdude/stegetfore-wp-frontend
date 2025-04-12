// src/components/Providers.tsx
'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

interface ProvidersProps {
  children?: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}