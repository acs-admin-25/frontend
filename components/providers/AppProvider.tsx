'use client';

import React from 'react';
import { ApiProvider } from './ApiProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { ModalProvider } from './ModalProvider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      <AuthProvider>
        <ThemeProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </ThemeProvider>
      </AuthProvider>
    </ApiProvider>
  );
} 