import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/calendar/outlook/auth-url
 * Generate Outlook OAuth URL for calendar integration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Microsoft OAuth configuration
    const clientId = process.env.OUTLOOK_CLIENT_ID!;
    const redirectUri = `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/calendar/outlook/callback`;
    
    // Generate OAuth URL
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', [
      'https://graph.microsoft.com/Calendars.Read',
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/User.Read'
    ].join(' '));
    authUrl.searchParams.set('state', session.user.email); // Pass user email as state

    return NextResponse.json({
      success: true,
      data: {
        authUrl: authUrl.toString()
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Outlook Calendar Auth URL] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 500 
      },
      { status: 500 }
    );
  }
} 