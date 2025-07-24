import type { 
  UserProfile, 
  ProfileUpdatePayload, 
  ProfileValidation, 
  ProfileCompletionStatus 
} from '@/lib/types/userProfile';

/**
 * Parse and format profile data from database
 */
export function parseProfileData(rawData: any): UserProfile {
  if (!rawData) return {} as UserProfile;
  
  return {
    user_id: rawData.user_id || rawData.id || '',
    name: rawData.name || rawData.full_name || '',
    email: rawData.email || '',
    company: rawData.company || '',
    job_title: rawData.job_title || rawData.title || '',
    phone: rawData.phone || rawData.phone_number || '',
    location: rawData.location || rawData.city || '',
    state: rawData.state || rawData.province || '',
    country: rawData.country || '',
    zipcode: rawData.zipcode || rawData.postal_code || '',
    bio: rawData.bio || rawData.biography || '',
    response_email: rawData.response_email || rawData.reply_email || '',
    email_signature: rawData.email_signature || '',
    lcp_tone: rawData.lcp_tone || 'professional',
    lcp_style: rawData.lcp_style || 'concise',
    lcp_sample_prompt: rawData.lcp_sample_prompt || '',
    lcp_automatic_enabled: rawData.lcp_automatic_enabled ?? true,
    profile_completed: rawData.profile_completed ?? false,
    onboarding_step: rawData.onboarding_step || 1,
    preferences: rawData.preferences || {},
    metadata: rawData.metadata || {},
    created_at: rawData.created_at || rawData.createdAt || new Date().toISOString(),
    updated_at: rawData.updated_at || rawData.updatedAt || new Date().toISOString(),
    status: rawData.status || 'active',
    email_verified: rawData.email_verified ?? false,
    mfa_enabled: rawData.mfa_enabled ?? false,
    organization_id: rawData.organization_id || '',
    role: rawData.role || 'user',
    account_id: rawData.account_id || '',
    last_login: rawData.last_login,
    login_count: rawData.login_count || 0,
  };
}

/**
 * Basic profile validation
 */
export function validateProfile(profile: UserProfile): ProfileValidation {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Basic validation
  if (!profile.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!profile.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(profile.email)) {
    errors.email = 'Invalid email format';
  }

  if (profile.phone && !isValidPhone(profile.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (profile.response_email && !isValidEmail(profile.response_email)) {
    errors.response_email = 'Invalid response email format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Simple profile completion calculation
 */
export function calculateProfileCompletion(profile: UserProfile): ProfileCompletionStatus {
  const fields = [
    'name', 'email', 'company', 'job_title', 'phone', 'bio', 
    'location', 'state', 'country', 'zipcode', 'response_email', 
    'email_signature', 'lcp_tone', 'lcp_style', 'lcp_sample_prompt'
  ];

  const completedFields = fields.filter(field => {
    const value = (profile as any)[field];
    return value && (typeof value !== 'string' || value.trim());
  });

  const completionPercentage = Math.round((completedFields.length / fields.length) * 100);
  const isComplete = completionPercentage >= 80; // 80% threshold

  return {
    isComplete,
    completionPercentage,
    missingFields: fields.filter(field => !completedFields.includes(field)),
    requiredFields: ['name', 'email'],
    optionalFields: fields.filter(field => !['name', 'email'].includes(field)),
  };
}

/**
 * Get profile field display name
 */
export function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: 'Full Name',
    email: 'Email Address',
    company: 'Company',
    job_title: 'Job Title',
    phone: 'Phone Number',
    location: 'City',
    state: 'State/Province',
    country: 'Country',
    zipcode: 'ZIP/Postal Code',
    bio: 'Bio',
    response_email: 'Response Email',
    email_signature: 'Email Signature',
    lcp_tone: 'Communication Tone',
    lcp_style: 'Communication Style',
    lcp_sample_prompt: 'Sample Prompt',
  };

  return fieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format profile data for display
 */
export function formatProfileField(field: string, value: any): string {
  if (!value) return '';

  switch (field) {
    case 'phone':
      return formatPhoneNumber(value);
    case 'email':
      return value.toLowerCase();
    case 'name':
      return value.trim();
    case 'company':
    case 'job_title':
    case 'location':
    case 'state':
    case 'country':
      return value.trim();
    default:
      return String(value);
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Check if it has 10-15 digits (international format)
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format US phone numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Format US phone numbers with country code
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return original if no standard format matches
  return phone;
}

/**
 * Get profile avatar initials
 */
export function getProfileInitials(profile: UserProfile): string {
  if (!profile.name) return '?';
  
  const names = profile.name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get profile display name
 */
export function getProfileDisplayName(profile: UserProfile): string {
  if (profile.name?.trim()) {
    return profile.name.trim();
  }
  
  if (profile.email) {
    return profile.email.split('@')[0];
  }
  
  return 'Unknown User';
}

/**
 * Check if profile has basic required fields
 */
export function hasRequiredOnboardingFields(profile: UserProfile): boolean {
  return !!(
    profile.name?.trim() &&
    profile.email?.trim()
  );
}

/**
 * Get next onboarding step
 */
export function getNextOnboardingStep(profile: UserProfile): number {
  const completion = calculateProfileCompletion(profile);
  
  if (completion.isComplete) {
    return 0; // Onboarding complete
  }
  
  // Simple step determination
  if (!profile.name || !profile.email) {
    return 1; // Basic info
  }
  
  if (!profile.company || !profile.job_title) {
    return 2; // Professional info
  }
  
  if (!profile.phone || !profile.location) {
    return 3; // Contact info
  }
  
  if (!profile.response_email || !profile.email_signature) {
    return 4; // Email settings
  }
  
  return 5; // LCP settings
}

/**
 * Prepare profile update payload
 */
export function prepareProfileUpdate(
  currentProfile: UserProfile,
  updates: Partial<ProfileUpdatePayload>
): { payload: ProfileUpdatePayload; validation: ProfileValidation } {
  // Create a mock updated profile for validation
  const mockUpdatedProfile = { ...currentProfile };
  
  // Apply basic field updates for validation
  Object.keys(updates).forEach(key => {
    if (key !== 'preferences' && key !== 'metadata' && key in updates) {
      (mockUpdatedProfile as any)[key] = updates[key as keyof ProfileUpdatePayload];
    }
  });
  
  // Validate the updated profile
  const validation = validateProfile(mockUpdatedProfile);
  
  // Prepare the update payload
  const payload: ProfileUpdatePayload = {};
  
  // Only include fields that are actually being updated
  Object.keys(updates).forEach(key => {
    if (key in updates) {
      (payload as any)[key] = updates[key as keyof ProfileUpdatePayload];
    }
  });
  
  return { payload, validation };
}

/**
 * Get profile statistics
 */
export function getProfileStatistics(profile: UserProfile) {
  const completion = calculateProfileCompletion(profile);
  
  return {
    totalFields: completion.requiredFields.length + completion.optionalFields.length,
    completedFields: completion.completionPercentage,
    lastUpdated: profile.updated_at ? new Date(profile.updated_at) : null,
    daysSinceLastUpdate: profile.updated_at 
      ? Math.floor((Date.now() - new Date(profile.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      : null,
    profileAge: profile.created_at 
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : null,
  };
} 