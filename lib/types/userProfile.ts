import type { User, UserPreferences, UserMetadata } from './auth';

// Extended user profile interface that includes all profile fields
export interface UserProfile extends User {
  // Basic profile information
  bio?: string;
  location?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  company?: string;
  job_title?: string;
  phone?: string;
  
  // Email settings
  acs_mail?: string;
  response_email?: string;
  custom_domain?: string;
  email_signature?: string;
  
  // LCP (Lead Communication Platform) settings
  lcp_tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  lcp_style?: 'concise' | 'detailed' | 'conversational' | 'direct';
  lcp_sample_prompt?: string;
  lcp_automatic_enabled?: boolean;
  
  // Communication preferences
  sms_enabled?: boolean;
  auto_emails?: boolean;
  
  // Profile completion status
  profile_completed?: boolean;
  onboarding_step?: number;
  
  // Extended preferences
  preferences?: ExtendedUserPreferences;
  
  // Extended metadata
  metadata?: ExtendedUserMetadata;
}

// Extended preferences interface
export interface ExtendedUserPreferences extends UserPreferences {
  // Communication preferences
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  
  // AI preferences
  ai_auto_response: boolean;
  ai_tone: 'professional' | 'casual' | 'friendly' | 'formal';
  ai_style: 'concise' | 'detailed' | 'conversational' | 'direct';
  
  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr';
  timezone: string;
  
  // Privacy preferences
  profile_visibility: 'public' | 'private' | 'team';
  data_sharing: boolean;
}

// Extended metadata interface
export interface ExtendedUserMetadata extends UserMetadata {
  // Profile metadata
  profile_updated_at?: string;
  last_activity?: string;
  login_count: number;
  
  // Device and session info
  device_info?: {
    device_id: string;
    device_type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    screen_resolution?: string;
  };
  
  // Location and timezone
  timezone: string;
  locale: string;
  ip_address: string;
  country_code?: string;
  
  // Usage statistics
  total_conversations?: number;
  total_emails_sent?: number;
  total_leads_managed?: number;
  
  // Feature flags and settings
  features_enabled?: string[];
  beta_features?: string[];
  
  // Website and branding
  website?: string;
  includeLogo?: boolean;
  includeSocialLinks?: boolean;
  
  // LCP and communication settings
  responseDelay?: number;
  maxConcurrentConversations?: number;
  notificationFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  enableAutoFollowUp?: boolean;
  followUpDelay?: number;
  enableSpamFilter?: boolean;
  spamSensitivity?: 'low' | 'medium' | 'high';
  
  // UI and display preferences
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  autoSave?: boolean;
  compactMode?: boolean;
  showTutorials?: boolean;
  
  // Security and session settings
  enableLoginAlerts?: boolean;
  enableSessionTimeout?: boolean;
  sessionTimeoutMinutes?: number;
  enablePasswordHistory?: boolean;
  requireStrongPassword?: boolean;
}

// Profile update payload interface
export interface ProfileUpdatePayload {
  // Basic profile fields
  bio?: string;
  location?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  company?: string;
  job_title?: string;
  phone?: string;
  
  // Email settings
  response_email?: string;
  custom_domain?: string;
  email_signature?: string;
  
  // LCP settings
  lcp_tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  lcp_style?: 'concise' | 'detailed' | 'conversational' | 'direct';
  lcp_sample_prompt?: string;
  lcp_automatic_enabled?: boolean;
  
  // Communication preferences
  sms_enabled?: boolean;
  auto_emails?: boolean;
  
  // Preferences
  preferences?: Partial<ExtendedUserPreferences>;
  
  // Metadata
  metadata?: Partial<ExtendedUserMetadata>;
}

// Profile context state interface
export interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isDirty: boolean; // Track if local changes haven't been synced
}

// Profile context actions interface
export interface UserProfileActions {
  // Profile operations
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdatePayload) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  
  // Local state management
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Optimistic updates
  optimisticUpdate: (updates: ProfileUpdatePayload) => void;
  revertOptimisticUpdate: () => void;
}

// Profile context interface
export interface UserProfileContextType extends UserProfileState, UserProfileActions {}

// Profile validation interface
export interface ProfileValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// Profile completion status
export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  requiredFields: string[];
  optionalFields: string[];
}

// Profile sync status
export interface ProfileSyncStatus {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  syncError: string | null;
  pendingChanges: ProfileUpdatePayload[];
} 