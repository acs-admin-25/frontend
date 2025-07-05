import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Id is required.' }, { status: 400 });
    }

    // Get current session to verify user
    const session = await getServerSession(authOptions) as Session & { user: { id: string; email: string; provider?: string; accessToken?: string } };
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }


    const apiUrl = `${config.API_URL}/users/auth/delete`;

    // Forward only essential cookies for authorization
    const cookie = request.headers.get('cookie');
    
    // Extract only the session_id cookie if it exists
    let sessionCookie = '';
    if (cookie) {
      const cookies = cookie.split(';');
      const sessionIdCookie = cookies.find(c => c.trim().startsWith('session_id='));
      if (sessionIdCookie) {
        sessionCookie = sessionIdCookie.trim();
      }
    }

    // First, revoke Google OAuth access if the user signed in with Google
    if (session.user.provider === 'google') {
      try {
        const googleRevokeUrl = 'https://oauth2.googleapis.com/revoke';
        const token = session.user.accessToken; // Access token is now properly stored in session
        
        if (token) {
          await fetch(googleRevokeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `token=${token}`,
          });
        }
      } catch (error) {
        console.error('Error revoking Google token:', error);
        // Continue with deletion even if token revocation fails
      }
    }


    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { cookie: sessionCookie } : {}),
      },
      body: JSON.stringify({ 
        id: session.user.id,
        provider: session.user.provider
      }),
      credentials: 'include',
    });
    

    // Log response for debugging
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
    } else {
    }

    if (!res.ok) {
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      return NextResponse.json({ error: errorData?.error || 'Failed to delete user.' }, { status: res.status });
    }

    // Create response with cleared cookies
    const response = NextResponse.json({ 
      ok: true,
      message: 'Account deleted successfully'
    });

    // Clear all auth-related cookies with proper attributes
    const cookieOptions = {
      path: '/',
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      httpOnly: true,
      domain: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined
    };

    // Clear NextAuth cookies
    response.cookies.set('next-auth.session-token', '', cookieOptions);
    response.cookies.set('next-auth.callback-url', '', cookieOptions);
    response.cookies.set('next-auth.csrf-token', '', cookieOptions);
    response.cookies.set('session_id', '', cookieOptions);

    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (err) {
    console.error('Delete account error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
