import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/calendar/google/auth-url
 * Generate Google OAuth URL for calendar integration
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

    // Get Google Calendar integration settings
    const integrationResponse = await fetch(`${request.nextUrl.origin}/api/calendar/google`);
    const integrationResult = await integrationResponse.json();

    if (!integrationResult.success || !integrationResult.data?.integration) {
      return NextResponse.json(
        { success: false, error: 'No Google Calendar integration found. Please set up integration first.', status: 400 },
        { status: 400 }
      );
    }

    const settings = integrationResult.data.integration.settings;
    
    // Generate OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', settings.clientId);
    authUrl.searchParams.set('redirect_uri', settings.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ].join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    return NextResponse.json({
      success: true,
      data: {
        authUrl: authUrl.toString()
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Google Calendar Auth URL] Error:', error);
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