import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import type { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    // Get current session to verify user
    const session = await getServerSession(authOptions) as Session & { 
      user: { 
        id: string; 
        email: string; 
        provider?: string; 
        accessToken?: string 
      } 
    };
    
    if (!session) {
      return NextResponse.json({ error: 'No active session found.' }, { status: 401 });
    }

    // Extract session_id from request body
    const requestBody = await request.json();
    const session_id = requestBody.session_id;

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    // Call GCP API Gateway for logout
    const response = await fetch(`${config.API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        session_id: session_id,
        user_id: session.user.id,
        logout_all: requestBody.logout_all || false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: data.error?.message || 'Logout failed.',
        details: data.error?.details
      }, { status: response.status });
    }

    // Create response with cleared cookies
    const nextResponse = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
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
    nextResponse.cookies.set('next-auth.session-token', '', cookieOptions);
    nextResponse.cookies.set('next-auth.callback-url', '', cookieOptions);
    nextResponse.cookies.set('next-auth.csrf-token', '', cookieOptions);
    nextResponse.cookies.set('session_id', '', cookieOptions);

    // Add headers to prevent caching
    nextResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    
    return nextResponse;

  } catch (error: any) {
    console.error('Logout API - Error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during logout.' 
    }, { status: 500 });
  }
} 