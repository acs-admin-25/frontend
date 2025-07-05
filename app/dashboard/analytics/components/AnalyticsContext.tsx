// /**
//  * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
//  * 
//  * This AnalyticsContext is exported but never imported or used in the application.
//  * The main analytics page (app/dashboard/analytics/page.tsx) uses useAnalyticsData()
//  * hook directly instead of this context.
//  * 
//  * TODO: Remove this file if no longer needed
//  * 
//  * Last checked: 2025-01-XX
//  * Status: Safe to delete
//  */

// 'use client';

// import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
// import { useThreadsApi } from '@/lib/utils/api';
// import { filterConversations, calculateKeyMetrics, formatMetrics, calculateAverageEVByMessage } from '@/lib/utils/analytics';
// import type { AnalyticsState, AnalyticsFilters, AnalyticsData } from '@/types/analytics';

// type AnalyticsAction =
//   | { type: 'SET_LOADING'; payload: boolean }
//   | { type: 'SET_ERROR'; payload: string | null }
//   | { type: 'SET_DATA'; payload: AnalyticsData }
//   | { type: 'SET_FILTERS'; payload: Partial<AnalyticsFilters> }
//   | { type: 'RESET_FILTERS' };

// interface AnalyticsContextType {
//   state: AnalyticsState;
//   dispatch: React.Dispatch<AnalyticsAction>;
//   refreshData: () => void;
// }

// const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// const initialState: AnalyticsState = {
//   data: null,
//   loading: true,
//   error: null,
//   filters: {
//     dateRange: '30d',
//     conversationStatus: 'all',
//     leadSource: 'all'
//   }
// };

// function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
//   switch (action.type) {
//     case 'SET_LOADING':
//       return { ...state, loading: action.payload };
//     case 'SET_ERROR':
//       return { ...state, error: action.payload, loading: false };
//     case 'SET_DATA':
//       return { ...state, data: action.payload, loading: false, error: null };
//     case 'SET_FILTERS':
//       return { 
//         ...state, 
//         filters: { ...state.filters, ...action.payload },
//         loading: true // Trigger data refresh
//       };
//     case 'RESET_FILTERS':
//       return { 
//         ...state, 
//         filters: initialState.filters,
//         loading: true // Trigger data refresh
//       };
//     default:
//       return state;
//   }
// }

// interface AnalyticsProviderProps {
//   children: ReactNode;
// }

// export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
//   const [state, dispatch] = useReducer(analyticsReducer, initialState);
//   const { data: conversations, loading: conversationsLoading, error: conversationsError, refetch } = useThreadsApi({
//     polling: false // Disable polling for analytics to avoid unnecessary refreshes
//   });

//   const processAnalyticsData = () => {
//     if (!conversations || conversations.length === 0) {
//       dispatch({ type: 'SET_DATA', payload: {
//         keyMetrics: [],
//         evByMessage: [],
//         dateRange: state.filters.dateRange,
//         lastUpdated: new Date().toISOString()
//       }});
//       return;
//     }

//     try {
//       // Filter conversations based on current filters
//       const filteredConversations = filterConversations(conversations, state.filters);
      
//       // Calculate metrics
//       const metrics = calculateKeyMetrics(filteredConversations);
//       const formattedMetrics = formatMetrics(metrics);
      
//       // Calculate EV by message
//       const evByMessage = calculateAverageEVByMessage(filteredConversations);
      
//       const analyticsData: AnalyticsData = {
//         keyMetrics: formattedMetrics,
//         evByMessage,
//         dateRange: state.filters.dateRange,
//         lastUpdated: new Date().toISOString()
//       };

//       dispatch({ type: 'SET_DATA', payload: analyticsData });
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to process analytics data' });
//     }
//   };

//   // Process data when conversations or filters change
//   useEffect(() => {
//     if (!conversationsLoading && !conversationsError) {
//       processAnalyticsData();
//     }
//   }, [conversations, state.filters, conversationsLoading, conversationsError]);

//   // Handle conversations loading state
//   useEffect(() => {
//     dispatch({ type: 'SET_LOADING', payload: conversationsLoading });
//   }, [conversationsLoading]);

//   // Handle conversations error
//   useEffect(() => {
//     if (conversationsError) {
//       dispatch({ type: 'SET_ERROR', payload: conversationsError });
//     }
//   }, [conversationsError]);

//   const refreshData = () => {
//     refetch();
//   };

//   const value: AnalyticsContextType = {
//     state,
//     dispatch,
//     refreshData
//   };

//   return (
//     <AnalyticsContext.Provider value={value}>
//       {children}
//     </AnalyticsContext.Provider>
//   );
// }

// export function useAnalytics() {
//   const context = useContext(AnalyticsContext);
//   if (context === undefined) {
//     throw new Error('useAnalytics must be used within an AnalyticsProvider');
//   }
//   return context;
// } 