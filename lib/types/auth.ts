export type SignupProvider = 'form' | 'google';
export type AuthType = 'new' | 'existing';
export type UserRole = 'admin' | 'user' | 'member';

// Backend User structure matching Firestore
export interface User {
  user_id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'suspended';
  email_verified: boolean;
  mfa_enabled: boolean;
  preferences?: UserPreferences;
  organization_id: string;
  role: UserRole;
  account_id: string;
  response_email?: string;
  last_login?: string;
  login_count?: number;
  metadata?: UserMetadata;
}

export interface UserPreferences {
  email_notifications: boolean;
  ai_auto_response: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
}

export interface UserMetadata {
  timezone: string;
  locale: string;
  ip_address: string;
}

// Session structure matching backend
export interface Session {
  session_id: string;
  user_id: string;
  account_id: string;
  organization_id: string;
  created_at: string;
  expires_at: string;
  last_active: string;
  ip_address: string;
  user_agent: string;
  permissions: Record<string, boolean>;
  status: 'active' | 'expired' | 'revoked';
  device_info?: DeviceInfo;
  security?: SecurityInfo;
}

export interface DeviceInfo {
  device_id: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface SecurityInfo {
  mfa_verified: boolean;
  location_verified: boolean;
  suspicious_activity: boolean;
}

// Auth tokens structure
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Frontend credentials interface
export interface Credentials {
  email: string;
  password: string;
  name?: string;
  provider: SignupProvider;
  idToken?: string; // Google OAuth ID token for verification
}

export interface SignupData extends Credentials {
  captchaToken?: string;
  firstName?: string;
  lastName?: string;
  phone_number?: string;
  organization?: string;
  idToken?: string; // Google OAuth ID token for verification
}

// NextAuth specific types (for compatibility)
export interface NextAuthUser {
  id: string;
  name: string;
  email: string;
  provider: SignupProvider;
  authType: AuthType;
  accessToken?: string;
  role?: UserRole;
  sessionCookie?: string | null;
  image?: string | null;
}

export interface NextAuthSession {
  user: NextAuthUser;
  sessionId?: string;
  expires: string;
}

export interface JWT {
  id: string;
  email: string;
  name: string;
  provider: SignupProvider;
  authType: AuthType;
  accessToken?: string;
  sessionCookie?: string;
  iat: number;
  exp: number;
}

// API response types matching backend
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    session: Session;
    tokens: AuthTokens;
  };
  error?: string;
  message?: string;
  status: number;
}

export interface LoginResponse extends AuthResponse {
  data?: {
    user: User;
    session: Session;
    tokens: AuthTokens;
  };
}

export interface SignupResponse extends AuthResponse {
  data?: {
    user: User;
    session: Session;
    tokens: AuthTokens;
  };
} 