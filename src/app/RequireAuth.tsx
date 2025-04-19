// src/app/RequireAuth.tsx
'use client';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12">Laddar...</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-center py-12">Du måste vara inloggad för att se innehållet på denna sida.</div>;
  }

  return <>{children}</>;
}
