'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useDbOperations } from '@/lib/hooks/useDbOperations';
import { parseProfileData } from '@/lib/utils/profileUtils';
import type { 
  UserProfile, 
  UserProfileContextType, 
  UserProfileState, 
  UserProfileActions,
  ProfileUpdatePayload 
} from '@/lib/types/userProfile';

// Create context
const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Initial state
const initialState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  isDirty: false,
};

// Action types
type UserProfileAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'CLEAR_PROFILE' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_LAST_UPDATED'; payload: Date }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'OPTIMISTIC_UPDATE'; payload: ProfileUpdatePayload }
  | { type: 'REVERT_OPTIMISTIC_UPDATE' };

// Reducer
function userProfileReducer(state: UserProfileState, action: UserProfileAction): UserProfileState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_PROFILE':
      return { 
        ...state, 
        profile: action.payload, 
        lastUpdated: new Date(),
        isDirty: false,
        error: null 
      };
    
    case 'CLEAR_PROFILE':
      return { 
        ...state, 
        profile: null, 
        lastUpdated: null,
        isDirty: false,
        error: null 
      };
    
    case 'UPDATE_PROFILE':
      return { 
        ...state, 
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
        lastUpdated: new Date(),
        isDirty: true
      };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    
    case 'OPTIMISTIC_UPDATE':
      if (!state.profile) return state;
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
        isDirty: true
      };
    
    case 'REVERT_OPTIMISTIC_UPDATE':
      // This will be handled by refetching the profile
      return { ...state, isDirty: false };
    
    default:
      return state;
  }
}

// Provider component
export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { select, update } = useDbOperations();
  const [state, dispatch] = useReducer(userProfileReducer, initialState);
  const userId = (session as any)?.user?.id;
  const lastProfileRef = useRef<UserProfile | null>(null);

  // Fetch profile from Firestore
  const fetchProfile = useCallback(async () => {
    if (!userId || status !== 'authenticated') return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await select({
        collection_name: 'Users',
        filters: [{ field: 'account_id', op: '==', value: userId }],
        account_id: userId,
      });
      
      if (response.error || !response.data?.items?.[0]) {
        throw new Error(response.error || 'User profile not found');
      }
      
      const userData = response.data.items[0];
      
      // Use centralized parsing function to transform raw data into UserProfile format
      const profile = parseProfileData(userData);
      
      dispatch({ type: 'SET_PROFILE', payload: profile });
      lastProfileRef.current = profile;
      
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to fetch profile' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [userId, status, select]);

  // Update profile in Firestore
  const updateProfile = useCallback(async (updates: ProfileUpdatePayload): Promise<boolean> => {
    if (!userId || !state.profile) {
      throw new Error('User not authenticated or profile not loaded');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Prepare update data
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      // Handle nested preferences
      if (updates.preferences) {
        updateData.preferences = {
          ...state.profile.preferences,
          ...updates.preferences,
        };
      }
      
      // Handle nested metadata
      if (updates.metadata) {
        updateData.metadata = {
          ...state.profile.metadata,
          ...updates.metadata,
          profile_updated_at: new Date().toISOString(),
        };
      }
      
      const response = await update({
        table_name: 'Users',
        index_name: 'id-index',
        key_name: 'id',
        key_value: userId,
        update_data: updateData,
      });
      
      if (response.success) {
        // Update local state with the new data
        const updatedProfile = { ...state.profile, ...updateData };
        dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
        lastProfileRef.current = updatedProfile;
        return true;
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('Failed to update user profile:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update profile' 
      });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [userId, state.profile, update]);

  // Refresh profile (refetch from Firestore)
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Optimistic update (update local state immediately)
  const optimisticUpdate = useCallback((updates: ProfileUpdatePayload) => {
    dispatch({ type: 'OPTIMISTIC_UPDATE', payload: updates });
  }, []);

  // Revert optimistic update
  const revertOptimisticUpdate = useCallback(() => {
    if (lastProfileRef.current) {
      dispatch({ type: 'SET_PROFILE', payload: lastProfileRef.current });
    }
  }, []);

  // Local state management actions
  const setProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
    lastProfileRef.current = profile;
  }, []);

  const clearProfile = useCallback(() => {
    dispatch({ type: 'CLEAR_PROFILE' });
    lastProfileRef.current = null;
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  // Fetch profile on authentication
  useEffect(() => {
    if (status === 'authenticated' && userId) {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      clearProfile();
    }
  }, [status, userId, fetchProfile, clearProfile]);

  // Context value
  const contextValue: UserProfileContextType = {
    ...state,
    fetchProfile,
    updateProfile,
    refreshProfile,
    setProfile,
    clearProfile,
    setError,
    setLoading,
    optimisticUpdate,
    revertOptimisticUpdate,
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
}

// Hook to use the user profile context
export function useUserProfile(): UserProfileContextType {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

// Hook for components that only need profile data
export function useUserProfileData() {
  const { profile, isLoading, error, lastUpdated } = useUserProfile();
  return { profile, isLoading, error, lastUpdated };
}

// Hook for components that need to update profile
export function useUserProfileActions() {
  const { 
    updateProfile, 
    refreshProfile, 
    optimisticUpdate, 
    revertOptimisticUpdate,
    setError,
    setLoading 
  } = useUserProfile();
  return { 
    updateProfile, 
    refreshProfile, 
    optimisticUpdate, 
    revertOptimisticUpdate,
    setError,
    setLoading 
  };
} 