'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// Simplified AuthProvider for JWT-only authentication
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 