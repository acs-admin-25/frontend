import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { apiClient } from '@/lib/api/client';

/**
 * POST /api/calendar/outlook/connection
 * Save Outlook Calendar integration settings
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accessToken, refreshToken, expiresAt } = body;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required', status: 400 },
        { status: 400 }
      );
    }

    // Get existing integration or create new one
    const integrationResponse = await apiClient.dbSelect({
      table_name: 'CalendarIntegrations',
      index_name: 'user-email-type-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    let integrationId: string;
    let existingIntegration: any = null;

    if (integrationResponse.success && integrationResponse.data?.items) {
      existingIntegration = integrationResponse.data.items.find(
        (integration: any) => integration.type === 'outlook-calendar'
      );
    }

    if (existingIntegration) {
      integrationId = existingIntegration.id;
    } else {
      integrationId = crypto.randomUUID();
    }

    const integration = {
      id: integrationId,
      type: 'outlook-calendar',
      name: 'Outlook Calendar Integration',
      isActive: true,
      settings: {
        accessToken,
        refreshToken,
        expiresAt,
        autoSync: true,
        syncInterval: 15, // minutes
      },
      lastSync: existingIntegration?.lastSync,
      syncStatus: 'idle',
      createdAt: existingIntegration?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const response = await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: integrationId,
      update_data: {
        ...integration,
        user_email: session.user.email,
        created_at: integration.createdAt.toISOString(),
        updated_at: integration.updatedAt.toISOString(),
      },
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to save integration settings');
    }

    return NextResponse.json({
      success: true,
      data: integration,
      message: existingIntegration ? 'Integration updated successfully' : 'Integration created successfully',
      status: 200,
    });

  } catch (error) {
    console.error('[Outlook Connection API] POST error:', error);
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