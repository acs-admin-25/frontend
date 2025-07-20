import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?error=outlook_auth_failed`
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle OAuth errors
    if (error) {
      console.error('[outlook/callback] OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?error=outlook_auth_failed`
      );
    }

    // Check for authorization code
    if (!code) {
      console.error('[outlook/callback] No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?error=no_auth_code`
      );
    }

    // Exchange authorization code for access token
    const clientSecret = encodeURIComponent(process.env.OUTLOOK_CLIENT_SECRET!);
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.OUTLOOK_CLIENT_ID!,
        client_secret: clientSecret,
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/calendar/outlook/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[outlook/callback] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        clientId: process.env.OUTLOOK_CLIENT_ID ? 'Set' : 'Not set',
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET ? 'Set' : 'Not set',
        redirectUri: `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/calendar/outlook/callback`,
      });
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?error=token_exchange_failed&details=${encodeURIComponent(errorText)}`
      );
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('[outlook/callback] No access token in response:', tokenData);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?error=token_exchange_failed`
      );
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

    // Create integration record
    const integrationId = crypto.randomUUID();
    const integration = {
      id: integrationId,
      type: 'outlook-calendar',
      name: 'Outlook Calendar Integration',
      isActive: true,
      settings: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: expiresAt.toISOString(),
        autoSync: true,
        syncInterval: 15, // minutes
      },
      lastSync: null,
      syncStatus: 'idle',
      user_email: session.user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save integration to database
    const integrationBody = {
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: integrationId,
      update_data: integration,
    };
    let saveResponse = await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(integrationBody),
    });

    // If table doesn't exist, try to create it first
    let saveResponseText = await saveResponse.text();
    if (!saveResponse.ok && saveResponseText.includes('not found')) {
      console.log('[outlook/callback] Table might not exist, trying to create it...');
      
      // Try to create the table structure
      const createTableBody = {
        table_name: 'CalendarIntegrations',
        index_name: 'id-index',
        key_name: 'id',
        key_value: 'table-schema',
        update_data: {
          id: 'table-schema',
          table_type: 'CalendarIntegrations',
          description: 'Calendar integration settings and OAuth tokens',
          schema: {
            id: 'string',
            type: 'string',
            name: 'string',
            isActive: 'boolean',
            settings: 'object',
            lastSync: 'string',
            syncStatus: 'string',
            user_email: 'string',
            created_at: 'string',
            updated_at: 'string'
          },
          indexes: [
            'id-index',
            'user-email-type-index',
            'type-index'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      const createTableResponse = await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(createTableBody),
      });

      // Only retry if table creation succeeded
      if (createTableResponse.ok) {
        console.log('[outlook/callback] Table created successfully, retrying save...');
        // Retry saving the integration (always use a new fetch and new body)
        saveResponse = await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify(integrationBody),
        });
        saveResponseText = await saveResponse.text();
      }
    }

    if (!saveResponse.ok) {
        console.error('[outlook/callback] Failed to save integration:', {
          status: saveResponse.status,
          error: saveResponseText,
          integrationId,
          userEmail: session.user.email,
        });
        // Show success for OAuth, but note DB pending
        const response = NextResponse.redirect(
          `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?success=outlook_connected&integration_id=${integrationId}&note=oauth_success_db_pending&outlook_access_token=${encodeURIComponent(tokenData.access_token)}`
        );
        response.headers.set('X-Outlook-Integration', JSON.stringify(integration));
        return response;
      }

    // Success! OAuth worked and tokens are saved
    console.log('[outlook/callback] Successfully connected Outlook calendar');
    console.log('[outlook/callback] Integration saved to database:', integrationId);
    console.log('[outlook/callback] Access token received:', tokenData.access_token ? 'Yes' : 'No');
    console.log('[outlook/callback] Refresh token received:', tokenData.refresh_token ? 'Yes' : 'No');
    
    // Redirect back to calendar page with success and access token in URL (for demo only)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?success=outlook_connected&integration_id=${integrationId}&outlook_access_token=${encodeURIComponent(tokenData.access_token)}`
    );

  } catch (error) {
    console.error('[outlook/callback] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/dashboard/calendar?error=callback_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unexpected error')}`
    );
  }
} 