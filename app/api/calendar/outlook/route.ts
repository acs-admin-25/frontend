import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { apiClient } from '@/lib/api/client';

/**
 * GET /api/calendar/outlook
 * Get Outlook Calendar integration settings and events
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

    // Get Outlook Calendar integration settings
    const integrationResponse = await apiClient.dbSelect({
      table_name: 'CalendarIntegrations',
      index_name: 'user-email-type-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    if (!integrationResponse.success) {
      throw new Error(integrationResponse.error || 'Failed to fetch integration settings');
    }

    const outlookIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'outlook-calendar'
    );

    if (!outlookIntegration) {
      return NextResponse.json({
        success: true,
        data: {
          integration: null,
          events: []
        },
        message: 'No Outlook Calendar integration found',
        status: 200,
      });
    }

    // If events are requested, fetch them from the database
    let events: any[] = [];
    if (includeEvents) {
      const eventsResponse = await apiClient.dbSelect({
        table_name: 'CalendarEvents',
        index_name: 'user-email-source-index',
        key_name: 'user_email',
        key_value: session.user.email,
      });

      if (eventsResponse.success && eventsResponse.data?.items) {
        events = eventsResponse.data.items.filter((event: any) => event.source === 'outlook-calendar');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        integration: outlookIntegration,
        events: events
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Outlook Calendar API] GET error:', error);
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
 * POST /api/calendar/outlook
 * Create or update Outlook Calendar integration settings
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
        ...settings,
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
    console.error('[Outlook Calendar API] POST error:', error);
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
 * PUT /api/calendar/outlook
 * Update Outlook Calendar integration (sync events, etc.)
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

    if (action === 'sync') {
      return await syncOutlookEvents(session.user.email);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action', status: 400 },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Outlook Calendar API] PUT error:', error);
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

// Helper function to sync Outlook events
async function syncOutlookEvents(userEmail: string): Promise<NextResponse> {
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

    const outlookIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'outlook-calendar'
    );

    if (!outlookIntegration) {
      throw new Error('No Outlook Calendar integration found');
    }

    const settings = outlookIntegration.settings;

    if (!settings.accessToken) {
      throw new Error('No access token available. Please complete OAuth authentication first.');
    }

    // Update sync status
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: outlookIntegration.id,
      update_data: {
        sync_status: 'syncing',
        updated_at: new Date().toISOString(),
      },
    });

    // Fetch events from Microsoft Graph API
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30); // Get events from 30 days ago

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 90); // Get events up to 90 days in the future

    const graphResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startTime.toISOString()}&endDateTime=${endTime.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!graphResponse.ok) {
      throw new Error('Failed to fetch events from Outlook Calendar');
    }

    const graphData = await graphResponse.json();
    const events = graphData.value || [];

    let syncedEvents = 0;
    const errors: string[] = [];

    // Process and save events
    for (const event of events) {
      try {
        const calendarEvent = {
          id: crypto.randomUUID(),
          title: event.subject || 'Untitled Event',
          description: event.body?.content || '',
          startTime: new Date(event.start.dateTime).toISOString(), // always ISO string with Z
          endTime: new Date(event.end.dateTime).toISOString(),     // always ISO string with Z
          allDay: event.isAllDay || false,
          location: event.location?.displayName || '',
          attendees: event.attendees?.map((a: any) => a.emailAddress?.address).filter(Boolean) || [],
          type: 'meeting',
          status: 'scheduled',
          source: 'outlook-calendar',
          externalId: event.id,
          user_email: userEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Prevent duplicate: check if event with same externalId and user_email exists
        const existing = await apiClient.dbSelect({
          table_name: 'CalendarEvents',
          index_name: 'externalId-user_email-index',
          key_name: 'externalId',
          key_value: calendarEvent.externalId,
          filter: { user_email: userEmail },
        });
        if (existing.success && existing.data?.items?.length > 0) {
          // Duplicate found, skip saving
          continue;
        }

        // Save event to database
        const saveResponse = await apiClient.dbUpdate({
          table_name: 'CalendarEvents',
          index_name: 'id-index',
          key_name: 'id',
          key_value: calendarEvent.id,
          update_data: calendarEvent,
        });

        if (saveResponse.success) {
          syncedEvents++;
        } else {
          errors.push(`Failed to save event: ${event.subject}`);
        }
      } catch (error) {
        errors.push(`Error processing event: ${event.subject}`);
      }
    }

    // Update sync status
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: outlookIntegration.id,
      update_data: {
        sync_status: errors.length > 0 ? 'error' : 'idle',
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        syncedEvents,
        errors,
        lastSync: new Date(),
      },
      message: `Successfully synced ${syncedEvents} events from Outlook Calendar`,
      status: 200,
    });

  } catch (error) {
    console.error('[Outlook Calendar Sync] Error:', error);
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