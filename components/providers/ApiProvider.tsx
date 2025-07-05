'use client';

import React, { createContext, useContext } from 'react';
import { ApiClient, apiClient } from '@/lib/api/client';

interface ApiContextType {
  apiClient: ApiClient;
}

export const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApiContext.Provider value={{ apiClient }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiClient() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiClient must be used within an ApiProvider');
  }
  return context;
} 