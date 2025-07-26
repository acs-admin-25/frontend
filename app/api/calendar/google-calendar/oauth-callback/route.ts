import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/calendar?error=google_calendar_auth_failed`
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle OAuth errors
    if (error) {
      console.error('[google-calendar/oauth-callback] OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/calendar?error=google_calendar_auth_failed`
      );
    }

    // Check for authorization code
    if (!code) {
      console.error('[google-calendar/oauth-callback] No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/calendar?error=no_auth_code`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/calendar/google-calendar/oauth-callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[google-calendar/oauth-callback] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
      });
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/calendar?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('[google-calendar/oauth-callback] No access token in response:', tokenData);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/calendar?error=token_exchange_failed`
      );
    }

    // Store the access token in sessionStorage (for demo purposes)
    // In a real app, you'd store this securely in your database
    console.log('[google-calendar/oauth-callback] Access token received:', tokenData.access_token ? 'Yes' : 'No');
    console.log('[google-calendar/oauth-callback] Refresh token received:', tokenData.refresh_token ? 'Yes' : 'No');
    
    // Redirect back to calendar page with success and access token in URL (for demo only)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/calendar?success=google_calendar_connected&google_calendar_token=${encodeURIComponent(tokenData.access_token)}`
    );

  } catch (error) {
    console.error('[google-calendar/oauth-callback] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/calendar?error=callback_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unexpected error')}`
    );
  }
} 