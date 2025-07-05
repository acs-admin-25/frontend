export type SignupProvider = 'form' | 'google';
export type AuthType = 'new' | 'existing';
export type UserRole = 'admin' | 'user';

export interface User {
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

export interface Credentials {
  email: string;
  password: string;
  name?: string;
  provider: SignupProvider;
}

export interface SignupData extends Credentials {
  captchaToken?: string;
  firstName?: string;
  lastName?: string;
}

// NextAuth specific types
export interface Session {
  user: User;
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

// API response types
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    session?: Session;
    authType?: AuthType;
  };
  error?: string;
  message?: string;
  status: number;
}

export interface LoginResponse extends AuthResponse {
  data?: {
    user: User;
    authType: AuthType;
    accessToken?: string;
  };
}

export interface SignupResponse extends AuthResponse {
  data?: {
    user: User;
    session: Session;
  };
} 