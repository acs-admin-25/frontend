import { useCallback, useMemo } from 'react';
import { useUserProfile, useUserProfileData, useUserProfileActions } from '@/components/providers/UserProfileProvider';
import { 
  validateProfile, 
  calculateProfileCompletion, 
  getProfileDisplayName, 
  getProfileInitials,
  getProfileStatistics,
  prepareProfileUpdate,
  hasRequiredOnboardingFields,
  getNextOnboardingStep
} from '@/lib/utils/profileUtils';
import type { ProfileUpdatePayload, ProfileValidation, ProfileCompletionStatus } from '@/lib/types/userProfile';

/**
 * Enhanced profile management hook with validation and optimistic updates
 */
export function useProfile() {
  const { profile, isLoading, error, lastUpdated, isDirty } = useUserProfileData();
  const { updateProfile, refreshProfile, optimisticUpdate, revertOptimisticUpdate, setError } = useUserProfileActions();

  // Memoized computed values
  const validation = useMemo(() => {
    if (!profile) return { isValid: false, errors: {}, warnings: {} };
    return validateProfile(profile);
  }, [profile]);

  const completion = useMemo(() => {
    if (!profile) return { isComplete: false, completionPercentage: 0, missingFields: [], requiredFields: [], optionalFields: [] };
    return calculateProfileCompletion(profile);
  }, [profile]);

  const displayName = useMemo(() => {
    if (!profile) return 'Unknown User';
    return getProfileDisplayName(profile);
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return '?';
    return getProfileInitials(profile);
  }, [profile]);

  const statistics = useMemo(() => {
    if (!profile) return null;
    return getProfileStatistics(profile);
  }, [profile]);

  const hasRequiredFields = useMemo(() => {
    if (!profile) return false;
    return hasRequiredOnboardingFields(profile);
  }, [profile]);

  const nextOnboardingStep = useMemo(() => {
    if (!profile) return 1;
    return getNextOnboardingStep(profile);
  }, [profile]);

  // Enhanced update function with validation
  const updateProfileWithValidation = useCallback(async (
    updates: Partial<ProfileUpdatePayload>,
    options: {
      optimistic?: boolean;
      validate?: boolean;
    } = {}
  ): Promise<{ success: boolean; validation?: ProfileValidation; error?: string }> => {
    const { optimistic = true, validate = true } = options;

    if (!profile) {
      return { success: false, error: 'Profile not loaded' };
    }

    // Prepare update with validation
    const { payload, validation: updateValidation } = prepareProfileUpdate(profile, updates);

    // Check validation if required
    if (validate && !updateValidation.isValid) {
      return { 
        success: false, 
        validation: updateValidation, 
        error: 'Profile validation failed' 
      };
    }

    try {
      // Apply optimistic update if enabled
      if (optimistic) {
        optimisticUpdate(payload);
      }

      // Perform the actual update
      const success = await updateProfile(payload);

      if (success) {
        return { success: true, validation: updateValidation };
      } else {
        // Revert optimistic update on failure
        if (optimistic) {
          revertOptimisticUpdate();
        }
        return { success: false, error: 'Failed to update profile' };
      }
    } catch (error) {
      // Revert optimistic update on error
      if (optimistic) {
        revertOptimisticUpdate();
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }, [profile, updateProfile, optimisticUpdate, revertOptimisticUpdate]);

  // Batch update function for multiple fields
  const batchUpdateProfile = useCallback(async (
    updates: Partial<ProfileUpdatePayload>,
    options: {
      optimistic?: boolean;
      validate?: boolean;
    } = {}
  ): Promise<{ success: boolean; validation?: ProfileValidation; error?: string }> => {
    return updateProfileWithValidation(updates, options);
  }, [updateProfileWithValidation]);

  // Update specific profile sections
  const updateBasicInfo = useCallback(async (
    basicInfo: {
      name?: string;
      email?: string;
      bio?: string;
    },
    options?: { optimistic?: boolean; validate?: boolean }
  ) => {
    return updateProfileWithValidation(basicInfo, options);
  }, [updateProfileWithValidation]);

  const updateProfessionalInfo = useCallback(async (
    professionalInfo: {
      company?: string;
      job_title?: string;
      location?: string;
      state?: string;
      country?: string;
      zipcode?: string;
    },
    options?: { optimistic?: boolean; validate?: boolean }
  ) => {
    return updateProfileWithValidation(professionalInfo, options);
  }, [updateProfileWithValidation]);

  const updateContactInfo = useCallback(async (
    contactInfo: {
      phone?: string;
      response_email?: string;
      custom_domain?: string;
    },
    options?: { optimistic?: boolean; validate?: boolean }
  ) => {
    return updateProfileWithValidation(contactInfo, options);
  }, [updateProfileWithValidation]);

  const updateEmailSettings = useCallback(async (
    emailSettings: {
      email_signature?: string;
      auto_emails?: boolean;
    },
    options?: { optimistic?: boolean; validate?: boolean }
  ) => {
    return updateProfileWithValidation(emailSettings, options);
  }, [updateProfileWithValidation]);

  const updateLCPSettings = useCallback(async (
    lcpSettings: {
      lcp_tone?: 'professional' | 'casual' | 'friendly' | 'formal';
      lcp_style?: 'concise' | 'detailed' | 'conversational' | 'direct';
      lcp_sample_prompt?: string;
      lcp_automatic_enabled?: boolean;
    },
    options?: { optimistic?: boolean; validate?: boolean }
  ) => {
    return updateProfileWithValidation(lcpSettings, options);
  }, [updateProfileWithValidation]);

  const updatePreferences = useCallback(async (
    preferences: {
      email_notifications?: boolean;
      sms_notifications?: boolean;
      push_notifications?: boolean;
      ai_auto_response?: boolean;
      theme?: 'light' | 'dark' | 'auto';
      language?: 'en' | 'es' | 'fr';
      timezone?: string;
      profile_visibility?: 'public' | 'private' | 'team';
      data_sharing?: boolean;
    },
    options?: { optimistic?: boolean; validate?: boolean }
  ) => {
    return updateProfileWithValidation({ preferences }, options);
  }, [updateProfileWithValidation]);

  // Profile completion helpers
  const markProfileComplete = useCallback(async (options?: { optimistic?: boolean }) => {
    return updateProfileWithValidation(
      { profile_completed: true },
      { ...options, validate: false }
    );
  }, [updateProfileWithValidation]);

  const updateOnboardingStep = useCallback(async (
    step: number,
    options?: { optimistic?: boolean }
  ) => {
    return updateProfileWithValidation(
      { onboarding_step: step },
      { ...options, validate: false }
    );
  }, [updateProfileWithValidation]);

  // Profile status helpers
  const isProfileComplete = completion.isComplete;
  const completionPercentage = completion.completionPercentage;
  const missingFields = completion.missingFields;

  return {
    // Profile data
    profile,
    isLoading,
    error,
    lastUpdated,
    isDirty,
    
    // Computed values
    validation,
    completion,
    displayName,
    initials,
    statistics,
    hasRequiredFields,
    nextOnboardingStep,
    
    // Status helpers
    isProfileComplete,
    completionPercentage,
    missingFields,
    
    // Update functions
    updateProfile: updateProfileWithValidation,
    batchUpdateProfile,
    updateBasicInfo,
    updateProfessionalInfo,
    updateContactInfo,
    updateEmailSettings,
    updateLCPSettings,
    updatePreferences,
    
    // Profile completion
    markProfileComplete,
    updateOnboardingStep,
    
    // Utility functions
    refreshProfile,
    setError,
  };
}

/**
 * Hook for components that only need profile data (read-only)
 */
export function useProfileData() {
  const { profile, isLoading, error, lastUpdated } = useUserProfileData();
  
  const displayName = useMemo(() => {
    if (!profile) return 'Unknown User';
    return getProfileDisplayName(profile);
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return '?';
    return getProfileInitials(profile);
  }, [profile]);

  const completion = useMemo(() => {
    if (!profile) return { isComplete: false, completionPercentage: 0, missingFields: [], requiredFields: [], optionalFields: [] };
    return calculateProfileCompletion(profile);
  }, [profile]);

  const statistics = useMemo(() => {
    if (!profile) return null;
    return getProfileStatistics(profile);
  }, [profile]);

  return {
    profile,
    isLoading,
    error,
    lastUpdated,
    displayName,
    initials,
    completion,
    statistics,
  };
}

/**
 * Hook for components that need to update profile
 */
export function useProfileActions() {
  const { updateProfile, refreshProfile, optimisticUpdate, revertOptimisticUpdate, setError } = useUserProfileActions();
  const { profile } = useUserProfileData();

  const updateProfileWithValidation = useCallback(async (
    updates: Partial<ProfileUpdatePayload>,
    options: {
      optimistic?: boolean;
      validate?: boolean;
    } = {}
  ): Promise<{ success: boolean; validation?: ProfileValidation; error?: string }> => {
    const { optimistic = true, validate = true } = options;

    if (!profile) {
      return { success: false, error: 'Profile not loaded' };
    }

    const { payload, validation: updateValidation } = prepareProfileUpdate(profile, updates);

    if (validate && !updateValidation.isValid) {
      return { 
        success: false, 
        validation: updateValidation, 
        error: 'Profile validation failed' 
      };
    }

    try {
      if (optimistic) {
        optimisticUpdate(payload);
      }

      const success = await updateProfile(payload);

      if (success) {
        return { success: true, validation: updateValidation };
      } else {
        if (optimistic) {
          revertOptimisticUpdate();
        }
        return { success: false, error: 'Failed to update profile' };
      }
    } catch (error) {
      if (optimistic) {
        revertOptimisticUpdate();
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }, [profile, updateProfile, optimisticUpdate, revertOptimisticUpdate]);

  return {
    updateProfile: updateProfileWithValidation,
    refreshProfile,
    setError,
  };
} 