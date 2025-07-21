import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { apiClient } from '@/lib/api/client';

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID!;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET!;
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI!;

/**
 * POST /api/calendar/outlook/connection
 * Save Outlook Calendar integration settings
 */
export async function POST(request: NextRequest) {
  const { code } = await request.json();

  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      scope: 'offline_access https://graph.microsoft.com/Calendars.ReadWrite'
    })
  });

  const tokenData = await tokenRes.json();

  // TODO: Save tokenData.access_token and tokenData.refresh_token to your user’s record in your DB

  return NextResponse.json({ success: true, token: tokenData });
}

/**
 * GET /api/calendar/outlook/connection
 * Get Outlook Calendar integration status
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

    // Get Outlook integration from database
    const integrationResponse = await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        table_name: 'CalendarIntegrations',
        index_name: 'user-email-type-index',
        key_name: 'user_email',
        key_value: session.user.email,
      }),
    });

    if (!integrationResponse.ok) {
      console.error('[outlook/connection] Failed to fetch integration:', await integrationResponse.text());
      return NextResponse.json({
        success: true,
        data: {
          integration: null,
          isConnected: false
        },
        message: 'No Outlook Calendar integration found',
        status: 200,
      });
    }

    const integrationData = await integrationResponse.json();
    const outlookIntegration = integrationData.success && integrationData.data?.items?.find(
      (integration: any) => integration.type === 'outlook-calendar'
    );

    if (!outlookIntegration) {
      return NextResponse.json({
        success: true,
        data: {
          integration: null,
          isConnected: false
        },
        message: 'No Outlook Calendar integration found',
        status: 200,
      });
    }

    // Check if token is expired
    const isExpired = outlookIntegration.settings?.expiresAt && 
      new Date(outlookIntegration.settings.expiresAt) < new Date();

    return NextResponse.json({
      success: true,
      data: {
        integration: outlookIntegration,
        isConnected: !isExpired && outlookIntegration.isActive
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Outlook Connection API] GET error:', error);
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