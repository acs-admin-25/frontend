import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { apiClient } from '@/lib/api/client';
import type { 
  CalendarEvent, 
  GoogleCalendarSettings,
  CalendarIntegration,
  IntegrationSyncResponse 
} from '@/types/calendar';

/**
 * GET /api/calendar/google
 * Get Google Calendar integration settings and events
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

    const { searchParams } = new URL(request.url);
    const includeEvents = searchParams.get('events') === 'true';

    // Get Google Calendar integration settings
    const integrationResponse = await apiClient.dbSelect({
      table_name: 'CalendarIntegrations',
      index_name: 'user-email-type-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    if (!integrationResponse.success) {
      throw new Error(integrationResponse.error || 'Failed to fetch integration settings');
    }

    const googleIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'google-calendar'
    );

    if (!googleIntegration) {
      return NextResponse.json({
        success: true,
        data: {
          integration: null,
          events: []
        },
        message: 'No Google Calendar integration found',
        status: 200,
      });
    }

    // If events are requested, fetch them from the database
    let events: CalendarEvent[] = [];
    if (includeEvents) {
      const eventsResponse = await apiClient.dbSelect({
        table_name: 'CalendarEvents',
        index_name: 'user-email-source-index',
        key_name: 'user_email',
        key_value: session.user.email,
      });

      if (eventsResponse.success && eventsResponse.data?.items) {
        events = eventsResponse.data.items
          .filter((event: any) => event.source === 'google-calendar')
          .map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            startTime: new Date(event.start_time),
            endTime: new Date(event.end_time),
            allDay: event.all_day,
            location: event.location,
            attendees: event.attendees || [],
            type: event.type,
            status: event.status,
            source: event.source,
            externalId: event.external_id,
            color: event.color,
            createdAt: new Date(event.created_at),
            updatedAt: new Date(event.updated_at),
          }));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        integration: googleIntegration,
        events
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Google Calendar API] GET error:', error);
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
 * POST /api/calendar/google
 * Create or update Google Calendar integration settings
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
    const { settings } = body;

    if (!settings?.clientId || !settings?.clientSecret) {
      return NextResponse.json(
        { success: false, error: 'Client ID and Client Secret are required', status: 400 },
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
        (integration: any) => integration.type === 'google-calendar'
      );
    }

    if (existingIntegration) {
      integrationId = existingIntegration.id;
    } else {
      integrationId = crypto.randomUUID();
    }

    const integration: CalendarIntegration = {
      id: integrationId,
      type: 'google-calendar',
      name: 'Google Calendar Integration',
      isActive: true,
      settings: {
        ...settings,
        calendarId: settings.calendarId || 'primary',
        eventTypes: settings.eventTypes || [],
        autoSync: settings.autoSync ?? true,
        syncInterval: settings.syncInterval || 15,
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
    console.error('[Google Calendar API] POST error:', error);
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
 * PUT /api/calendar/google
 * Handle OAuth callback and sync operations
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'oauth-callback') {
      return await handleOAuthCallback(session.user.email, request);
    } else if (action === 'sync') {
      return await syncGoogleCalendarEvents(session.user.email);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action', status: 400 },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Google Calendar API] PUT error:', error);
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
 * DELETE /api/calendar/google
 * Delete Google Calendar integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Get integration to delete
    const integrationResponse = await apiClient.dbSelect({
      table_name: 'CalendarIntegrations',
      index_name: 'user-email-type-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    if (!integrationResponse.success) {
      throw new Error(integrationResponse.error || 'Failed to fetch integration');
    }

    const googleIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'google-calendar'
    );

    if (!googleIntegration) {
      return NextResponse.json(
        { success: false, error: 'No Google Calendar integration found', status: 404 },
        { status: 404 }
      );
    }

    // Delete integration
    const response = await apiClient.dbDelete({
      table_name: 'CalendarIntegrations',
      attribute_name: 'id',
      attribute_value: googleIntegration.id,
      is_primary_key: true,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete integration');
    }

    return NextResponse.json({
      success: true,
      message: 'Google Calendar integration deleted successfully',
      status: 200,
    });

  } catch (error) {
    console.error('[Google Calendar API] DELETE error:', error);
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

// Helper function to handle OAuth callback
async function handleOAuthCallback(userEmail: string, request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Authorization code is required', status: 400 },
        { status: 400 }
      );
    }

    // Get integration settings
    const integrationResponse = await apiClient.dbSelect({
      table_name: 'CalendarIntegrations',
      index_name: 'user-email-type-index',
      key_name: 'user_email',
      key_value: userEmail,
    });

    if (!integrationResponse.success) {
      throw new Error('Failed to fetch integration settings');
    }

    const googleIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'google-calendar'
    );

    if (!googleIntegration) {
      throw new Error('No Google Calendar integration found');
    }

    const settings = googleIntegration.settings as GoogleCalendarSettings;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/calendar/google/oauth-callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for access token');
    }

    const tokenData = await tokenResponse.json();

    // Update integration with tokens
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: googleIntegration.id,
      update_data: {
        'settings.access_token': tokenData.access_token,
        'settings.refresh_token': tokenData.refresh_token,
        updated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'OAuth authentication successful',
      status: 200,
    });

  } catch (error) {
    console.error('[Google Calendar OAuth] Error:', error);
    throw error;
  }
}

// Helper function to sync Google Calendar events
async function syncGoogleCalendarEvents(userEmail: string): Promise<NextResponse> {
  try {
    // Get integration settings
    const integrationResponse = await apiClient.dbSelect({
      table_name: 'CalendarIntegrations',
      index_name: 'user-email-type-index',
      key_name: 'user_email',
      key_value: userEmail,
    });

    if (!integrationResponse.success) {
      throw new Error('Failed to fetch integration settings');
    }

    const googleIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'google-calendar'
    );

    if (!googleIntegration) {
      throw new Error('No Google Calendar integration found');
    }

    const settings = googleIntegration.settings as GoogleCalendarSettings;

    if (!settings.accessToken) {
      throw new Error('No access token available. Please complete OAuth authentication first.');
    }

    // Update sync status
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: googleIntegration.id,
      update_data: {
        sync_status: 'syncing',
        updated_at: new Date().toISOString(),
      },
    });

    // Fetch events from Google Calendar
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30); // Get events from 30 days ago

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 90); // Get events up to 90 days in the future

    const googleResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(settings.calendarId)}/events?` +
      `timeMin=${startTime.toISOString()}&timeMax=${endTime.toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!googleResponse.ok) {
      // Try to refresh token if access token is expired
      if (googleResponse.status === 401 && settings.refreshToken) {
        const refreshed = await refreshGoogleToken(googleIntegration.id, settings);
        if (refreshed) {
          // Retry the request with new token
          return await syncGoogleCalendarEvents(userEmail);
        }
      }
      throw new Error('Failed to fetch events from Google Calendar');
    }

    const googleData = await googleResponse.json();
    const events = googleData.items || [];

    let syncedEvents = 0;
    const errors: string[] = [];

    // Process each event
    for (const event of events) {
      try {
        const calendarEvent: Partial<CalendarEvent> = {
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          startTime: new Date(event.start.dateTime || event.start.date),
          endTime: new Date(event.end.dateTime || event.end.date),
          allDay: !event.start.dateTime,
          location: event.location || '',
          attendees: event.attendees?.map((attendee: any) => attendee.email) || [],
          type: 'appointment',
          status: event.status === 'confirmed' ? 'confirmed' : 'pending',
          source: 'google-calendar',
          externalId: event.id,
          color: event.colorId ? getGoogleCalendarColor(event.colorId) : '#0e6537',
        };

        // Check if event already exists
        const existingEventResponse = await apiClient.dbSelect({
          table_name: 'CalendarEvents',
          index_name: 'external-id-index',
          key_name: 'external_id',
          key_value: event.id,
        });

        if (existingEventResponse.success && existingEventResponse.data?.items && existingEventResponse.data.items.length > 0) {
          // Update existing event
          await apiClient.dbUpdate({
            table_name: 'CalendarEvents',
            index_name: 'id-index',
            key_name: 'id',
            key_value: existingEventResponse.data.items[0].id,
            update_data: {
              ...calendarEvent,
              updated_at: new Date().toISOString(),
            },
          });
        } else {
          // Create new event
          await apiClient.dbUpdate({
            table_name: 'CalendarEvents',
            index_name: 'id-index',
            key_name: 'id',
            key_value: crypto.randomUUID(),
            update_data: {
              ...calendarEvent,
              user_email: userEmail,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          });
        }

        syncedEvents++;
      } catch (error) {
        errors.push(`Failed to sync event ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update integration with sync results
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: googleIntegration.id,
      update_data: {
        sync_status: errors.length > 0 ? 'error' : 'idle',
        last_sync: new Date().toISOString(),
        error_message: errors.length > 0 ? errors.join('; ') : undefined,
        updated_at: new Date().toISOString(),
      },
    });

    const syncResponse: IntegrationSyncResponse = {
      syncedEvents,
      syncedAvailability: 0,
      errors,
      lastSync: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: syncResponse,
      message: `Successfully synced ${syncedEvents} events`,
      status: 200,
    });

  } catch (error) {
    console.error('[Google Calendar Sync] Error:', error);
    throw error;
  }
}

// Helper function to refresh Google access token
async function refreshGoogleToken(integrationId: string, settings: GoogleCalendarSettings): Promise<boolean> {
  try {
    if (!settings.refreshToken) {
      return false;
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: settings.refreshToken,
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      return false;
    }

    const tokenData = await tokenResponse.json();

    // Update integration with new access token
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: integrationId,
      update_data: {
        'settings.access_token': tokenData.access_token,
        updated_at: new Date().toISOString(),
      },
    });

    return true;
  } catch (error) {
    console.error('[Google Calendar Token Refresh] Error:', error);
    return false;
  }
}

// Helper function to get Google Calendar color
function getGoogleCalendarColor(colorId: string): string {
  const colors: Record<string, string> = {
    '1': '#7986cb', // Lavender
    '2': '#33b679', // Sage
    '3': '#8e63ce', // Grape
    '4': '#e67c73', // Flamingo
    '5': '#f6c026', // Banana
    '6': '#f5511d', // Tangerine
    '7': '#039be5', // Peacock
    '8': '#616161', // Graphite
    '9': '#3f51b5', // Blueberry
    '10': '#0b8043', // Basil
    '11': '#d60000', // Tomato
  };
  
  return colors[colorId] || '#0e6537';
} 