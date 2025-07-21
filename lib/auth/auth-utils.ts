import { Session, User } from 'next-auth';
import type { User as BackendUser, Session as BackendSession, AuthTokens } from '@/types/auth';

/**
 * Enhanced session cookie management for backend integration
 * @param session The current session object
 * @returns void
 */
export const handleSessionCookie = (session: Session): void => {
    // Handle backend session_id
    if ((session as any).sessionId) {
        const secure = process.env.NODE_ENV === 'production' ? '; secure' : '';
        const cookieString = `session_id=${(session as any).sessionId}; path=/; samesite=lax${secure}`;
        document.cookie = cookieString;
        return;
    }
    
    // Handle backend tokens
    if ((session as any).tokens) {
        const tokens = (session as any).tokens as AuthTokens;
        storeAuthTokens(tokens);
    }
    
    // Fallback to session.sessionCookie (legacy approach)
    const sessionCookie = (session as any).sessionCookie;
    if (sessionCookie) {
        let match = sessionCookie.match(/session_id=([^;,\s]+)/);
        if (!match) {
            match = sessionCookie.match(/session_id=([^;]+)/);
        }
        if (match?.[1]) {
            const secure = process.env.NODE_ENV === 'production' ? '; secure' : '';
            const cookieString = `session_id=${match[1]}; path=/; samesite=lax${secure}`;
            document.cookie = cookieString;
        }
    }
};

/**
 * Determines the redirect path based on authentication type
 * @param authType The authentication type ('new' | 'existing')
 * @returns string The redirect path
 */
export const getAuthRedirectPath = (authType?: string): string => {
    return authType === 'existing' ? '/dashboard' : '/new-user';
};

/**
 * Handles authentication errors and returns appropriate error message
 * @param error The error object
 * @returns string The error message
 */
export const handleAuthError = (error: any): string => {
    console.error('Authentication Error:', error);
    
    if (error?.status === 401) {
        return 'Incorrect username or password';
    }
    if (error?.status === 404) {
        return 'User does not exist';
    }
    if (error?.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

/**
 * Validates form data for authentication
 * @param formData The form data object
 * @returns { isValid: boolean; error?: string }
 */
export const validateAuthForm = (formData: { email?: string; password?: string }): { isValid: boolean; error?: string } => {
    if (!formData.email || !formData.password) {
        return { isValid: false, error: 'Please fill in all fields' };
    }
    if (!formData.email.includes('@')) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }
    if (formData.password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long' };
    }
    return { isValid: true };
};

/**
 * Clears all authentication-related data
 * @returns void
 */
export const clearAuthData = (): void => {
    // Clear localStorage items
    localStorage.removeItem('authType');
    localStorage.removeItem('next-auth.session-token');
    
    // Clear sessionStorage items
    sessionStorage.removeItem('next-auth.session-token');
    
    // Clear cookies
    const secure = process.env.NODE_ENV === 'production' ? '; secure' : '';
    document.cookie = `session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${secure}`;
    document.cookie = `next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${secure}`;
    document.cookie = `next-auth.callback-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${secure}`;
    document.cookie = `next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${secure}`;
};

/**
 * Formats user data for authentication
 * @param user The user object
 * @param provider The authentication provider
 * @returns Formatted user data
 */
export const formatUserData = (user: User, provider: string = 'form') => {
    return {
        email: (user as any).email,
        name: (user as any).name,
        provider,
        authType: (user as any).authType || 'existing',
    };
};

/**
 * Sets the authentication type in localStorage
 * @param type The authentication type ('new' | 'existing')
 * @returns void
 */
export const setAuthType = (type: 'new' | 'existing'): void => {
    localStorage.setItem('authType', type);
};

/**
 * Gets the current authentication type from localStorage
 * @returns 'new' | 'existing' | null
 */
export const getAuthType = (): 'new' | 'existing' | null => {
    return localStorage.getItem('authType') as 'new' | 'existing' | null;
};

/**
 * Validates a session object
 * @param session The session object to validate
 * @returns boolean indicating if the session is valid
 */
export const validateSession = (session: any): boolean => {
    if (!session?.user) return false;
    return true;
};

/**
 * Formats session data for client-side use
 * @param session The raw session data
 * @returns Formatted session data
 */
export const formatSession = (session: any) => {
    if (!session?.user) return null;
    
    return {
        user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            provider: session.user.provider,
            authType: session.user.authType,
            accessToken: session.user.accessToken
        }
    };
};

/**
 * Verifies that the session_id cookie is present and valid
 * @returns boolean indicating if the session_id cookie exists
 */
export const verifySessionCookie = (): boolean => {
    if (typeof document === 'undefined') {
        // Server-side rendering - assume cookie exists
        return true;
    }
    
    const cookies = document.cookie.split(';');
    const sessionIdCookie = cookies.find(cookie => 
        cookie.trim().startsWith('session_id=')
    );
    
    if (!sessionIdCookie) {
        return false;
    }
    
    const sessionId = sessionIdCookie.split('=')[1]?.trim();
    return !!sessionId && sessionId.length > 0;
};

/**
 * Checks if the current environment requires secure cookies
 * @returns boolean indicating if secure cookies are required
 */
export const isSecureEnvironment = (): boolean => {
    return process.env.NODE_ENV === 'production';
};

// Backend Integration Functions

/**
 * Store authentication tokens in localStorage
 * @param tokens The authentication tokens
 */
export const storeAuthTokens = (tokens: AuthTokens): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('acs_access_token', tokens.access_token);
        localStorage.setItem('acs_refresh_token', tokens.refresh_token);
        localStorage.setItem('acs_token_expires', (Date.now() + tokens.expires_in * 1000).toString());
    }
};

/**
 * Get stored authentication tokens
 * @returns AuthTokens or null
 */
export const getStoredTokens = (): AuthTokens | null => {
    if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('acs_access_token');
        const refreshToken = localStorage.getItem('acs_refresh_token');
        const expiresAt = localStorage.getItem('acs_token_expires');
        
        if (accessToken && refreshToken && expiresAt) {
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: parseInt(expiresAt) - Date.now(),
            };
        }
    }
    return null;
};

/**
 * Clear stored authentication tokens
 */
export const clearStoredTokens = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('acs_access_token');
        localStorage.removeItem('acs_refresh_token');
        localStorage.removeItem('acs_token_expires');
    }
};

/**
 * Check if stored token is expired
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (): boolean => {
    const tokens = getStoredTokens();
    if (!tokens) return true;
    
    return tokens.expires_in <= 0;
};

/**
 * Convert NextAuth user to backend user format
 * @param nextAuthUser NextAuth user object
 * @returns Backend user format
 */
export const convertNextAuthUserToBackendUser = (nextAuthUser: any): BackendUser => {
    return {
        user_id: nextAuthUser.id || '',
        email: nextAuthUser.email || '',
        name: nextAuthUser.name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        email_verified: true,
        mfa_enabled: false,
        organization_id: nextAuthUser.organization_id || '',
        role: nextAuthUser.role || 'user',
        account_id: nextAuthUser.account_id || nextAuthUser.id || '',
        response_email: nextAuthUser.response_email,
        last_login: new Date().toISOString(),
        login_count: nextAuthUser.login_count || 0,
        preferences: {
            email_notifications: true,
            ai_auto_response: true,
            theme: 'light',
            language: 'en',
        },
        metadata: {
            timezone: 'UTC',
            locale: 'en-US',
            ip_address: '',
        },
    };
};

/**
 * Convert backend user to NextAuth user format
 * @param backendUser Backend user object
 * @returns NextAuth user format
 */
export const convertBackendUserToNextAuthUser = (backendUser: BackendUser): any => {
    return {
        id: backendUser.user_id,
        email: backendUser.email,
        name: backendUser.name,
        provider: 'form',
        authType: 'existing',
        role: backendUser.role,
        organization_id: backendUser.organization_id,
        account_id: backendUser.account_id,
        response_email: backendUser.response_email,
        login_count: backendUser.login_count,
    };
};

/**
 * Validate backend session
 * @param session Backend session object
 * @returns boolean indicating if session is valid
 */
export const validateBackendSession = (session: BackendSession): boolean => {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    return expiresAt > now && session.status === 'active';
};

/**
 * Check user permissions
 * @param user Backend user object
 * @param requiredPermissions Array of required permissions
 * @returns boolean indicating if user has all required permissions
 */
export const checkUserPermissions = (user: BackendUser, requiredPermissions: string[]): boolean => {
    if (user.role === 'admin') return true;
    
    const userPermissions = getUserDefaultPermissions(user.role);
    
    return requiredPermissions.every(permission => 
        userPermissions.includes(permission) || userPermissions.includes('*')
    );
};

/**
 * Get default permissions for user role
 * @param role User role
 * @returns Array of permissions
 */
const getUserDefaultPermissions = (role: string): string[] => {
    const permissions: Record<string, string[]> = {
        admin: ['*'],
        user: [
            'view_conversations',
            'edit_settings',
            'read:own',
            'write:own',
            'view_dashboard',
            'send_emails',
            'view_contacts',
            'view_calendar'
        ],
        member: [
            'view_conversations',
            'edit_settings',
            'read:own',
            'write:own',
            'read:team',
            'view_dashboard',
            'send_emails',
            'view_contacts',
            'view_calendar',
            'manage_users'
        ],
    };
    
    return permissions[role] || permissions.user;
}; 