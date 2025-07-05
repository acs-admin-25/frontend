# Session Verification Feature

## Overview

The session verification feature ensures that authenticated users have a valid `session_id` cookie present in their browser. This provides an additional layer of security by verifying that the session cookie exists and is not empty.

## How It Works

### 1. Session Cookie Verification

The `verifySessionCookie()` function in `lib/auth-utils.ts` checks for the presence of a `session_id` cookie:

```typescript
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
```

### 2. AuthGuard Integration

The `AuthGuard` component automatically verifies the session cookie for all authenticated users:

```typescript
useEffect(() => {
    const checkSessionCookie = () => {
        if (status === 'authenticated') {
            const hasSessionCookie = verifySessionCookie();
            if (!hasSessionCookie) {
                router.push('/unauthorized');
                return;
            }
        }
        setIsCheckingSession(false);
    };

    const timer = setTimeout(checkSessionCookie, 100);
    return () => clearTimeout(timer);
}, [status, router]);
```

### 3. Unauthorized Page

When session verification fails, users are redirected to `/unauthorized` which:

- Displays a clear message about the session verification failure
- Provides options for clearing session data
- Forces users to log out and clear all authentication data

## Security Features

### Environment-Based Cookie Security

Cookies are automatically set with appropriate security flags based on the environment:

- **Development**: Cookies are set without the `secure` flag
- **Production**: Cookies are set with the `secure` flag for HTTPS-only transmission

```typescript
export const isSecureEnvironment = (): boolean => {
    return process.env.NODE_ENV === 'production';
};
```

### Cookie Attributes

Session cookies are set with the following attributes:

- `path=/` - Available across the entire domain
- `samesite=lax` - Provides CSRF protection
- `secure` - Only transmitted over HTTPS (production only)

## Usage

### Automatic Protection

All pages wrapped with `AuthGuard` automatically benefit from session verification:

```typescript
// app/dashboard/layout.tsx
export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
```

### Manual Verification

You can also use the `useSessionVerification` hook for custom components:

```typescript
import { useSessionVerification } from '@/hooks/useSessionVerification';

function MyComponent() {
  const { isSessionValid, isChecking, verifySession } = useSessionVerification({
    redirectTo: '/unauthorized',
    enabled: true
  });

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!isSessionValid) {
    return <div>Session invalid</div>;
  }

  return <div>Your content here</div>;
}
```

## Common Scenarios

### 1. Missing Session Cookie

**Cause**: Browser privacy settings, cookie blocking, or session expiration
**Solution**: User is redirected to `/unauthorized` to clear session and re-authenticate

### 2. Empty Session Cookie

**Cause**: Malformed cookie or server-side session issues
**Solution**: Same as missing cookie - redirect to unauthorized page

### 3. Development vs Production

**Development**: Less strict cookie requirements for easier testing
**Production**: Secure cookies with HTTPS-only transmission

## Troubleshooting

### Session Verification Failing

1. Check browser console for cookie-related errors
2. Verify that cookies are enabled in browser settings
3. Check for browser extensions that might block cookies
4. Ensure the domain matches the cookie settings

### Testing Session Verification

1. Open browser developer tools
2. Go to Application/Storage tab
3. Delete the `session_id` cookie
4. Refresh the page
5. Should redirect to `/unauthorized`

## API Reference

### Functions

#### `verifySessionCookie()`
Returns `boolean` indicating if the session_id cookie exists and is not empty.

#### `isSecureEnvironment()`
Returns `boolean` indicating if the current environment requires secure cookies.

#### `clearAuthData()`
Clears all authentication-related data including cookies, localStorage, and sessionStorage.

### Hook

#### `useSessionVerification(options)`

**Options:**
- `redirectTo?: string` - URL to redirect to on verification failure (default: '/unauthorized')
- `enabled?: boolean` - Whether to enable session verification (default: true)

**Returns:**
- `isSessionValid: boolean` - Whether the session cookie is valid
- `isChecking: boolean` - Whether verification is in progress
- `verifySession: () => boolean` - Function to manually verify session

## Best Practices

1. **Always use AuthGuard** for protected routes
2. **Test in both development and production** environments
3. **Handle edge cases** like server-side rendering
4. **Provide clear user feedback** when verification fails
5. **Log verification failures** for debugging purposes 