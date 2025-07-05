import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { apiClient } from '@/lib/api/client';
import type { 
  CalendarEvent, 
  CalendlySettings,
  CalendarIntegration,
  IntegrationSyncResponse 
} from '@/types/calendar';

/**
 * GET /api/calendar/calendly
 * Get Calendly integration settings and events
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

    // Get Calendly integration settings
    const integrationResponse = await apiClient.dbSelect({
      table_name: 'CalendarIntegrations',
      index_name: 'user-email-type-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    if (!integrationResponse.success) {
      throw new Error(integrationResponse.error || 'Failed to fetch integration settings');
    }

    const calendlyIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'calendly'
    );

    if (!calendlyIntegration) {
      return NextResponse.json({
        success: true,
        data: {
          integration: null,
          events: []
        },
        message: 'No Calendly integration found',
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
          .filter((event: any) => event.source === 'calendly')
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
        integration: calendlyIntegration,
        events
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Calendly API] GET error:', error);
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
 * POST /api/calendar/calendly
 * Create or update Calendly integration settings
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

    if (!settings?.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required', status: 400 },
        { status: 400 }
      );
    }

    // Validate Calendly API key by making a test request
    try {
      const testResponse = await fetch('https://api.calendly.com/user', {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        return NextResponse.json(
          { success: false, error: 'Invalid Calendly API key', status: 400 },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to validate Calendly API key', status: 400 },
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
        (integration: any) => integration.type === 'calendly'
      );
    }

    if (existingIntegration) {
      integrationId = existingIntegration.id;
    } else {
      integrationId = crypto.randomUUID();
    }

    const integration: CalendarIntegration = {
      id: integrationId,
      type: 'calendly',
      name: 'Calendly Integration',
      isActive: true,
      settings: {
        ...settings,
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
    console.error('[Calendly API] POST error:', error);
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
 * PUT /api/calendar/calendly/sync
 * Manually trigger Calendly sync
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
      return await syncCalendlyEvents(session.user.email);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action', status: 400 },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Calendly API] PUT error:', error);
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
 * DELETE /api/calendar/calendly
 * Delete Calendly integration
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

    const calendlyIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'calendly'
    );

    if (!calendlyIntegration) {
      return NextResponse.json(
        { success: false, error: 'No Calendly integration found', status: 404 },
        { status: 404 }
      );
    }

    // Delete integration
    const response = await apiClient.dbDelete({
      table_name: 'CalendarIntegrations',
      attribute_name: 'id',
      attribute_value: calendlyIntegration.id,
      is_primary_key: true,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete integration');
    }

    return NextResponse.json({
      success: true,
      message: 'Calendly integration deleted successfully',
      status: 200,
    });

  } catch (error) {
    console.error('[Calendly API] DELETE error:', error);
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

// Helper function to sync Calendly events
async function syncCalendlyEvents(userEmail: string): Promise<NextResponse> {
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

    const calendlyIntegration = integrationResponse.data?.items?.find(
      (integration: any) => integration.type === 'calendly'
    );

    if (!calendlyIntegration) {
      throw new Error('No Calendly integration found');
    }

    const settings = calendlyIntegration.settings as CalendlySettings;

    // Update sync status
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: calendlyIntegration.id,
      update_data: {
        sync_status: 'syncing',
        updated_at: new Date().toISOString(),
      },
    });

    // Fetch scheduled events from Calendly
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30); // Get events from 30 days ago

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 90); // Get events up to 90 days in the future

    const calendlyResponse = await fetch(
      `https://api.calendly.com/scheduled_events?min_start_time=${startTime.toISOString()}&max_start_time=${endTime.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!calendlyResponse.ok) {
      throw new Error('Failed to fetch events from Calendly');
    }

    const calendlyData = await calendlyResponse.json();
    const events = calendlyData.collection || [];

    let syncedEvents = 0;
    const errors: string[] = [];

    // Process each event
    for (const event of events) {
      try {
        const calendarEvent: Partial<CalendarEvent> = {
          title: event.event_type.name,
          description: event.event_type.description || '',
          startTime: new Date(event.start_time),
          endTime: new Date(event.end_time),
          allDay: false,
          location: event.location?.location || '',
          attendees: event.invitees?.map((invitee: any) => invitee.email) || [],
          type: 'appointment',
          status: 'confirmed',
          source: 'calendly',
          externalId: event.uri,
          color: event.event_type.color || '#0e6537',
        };

        // Check if event already exists
        const existingEventResponse = await apiClient.dbSelect({
          table_name: 'CalendarEvents',
          index_name: 'external-id-index',
          key_name: 'external_id',
          key_value: event.uri,
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
        errors.push(`Failed to sync event ${event.uri}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update integration with sync results
    await apiClient.dbUpdate({
      table_name: 'CalendarIntegrations',
      index_name: 'id-index',
      key_name: 'id',
      key_value: calendlyIntegration.id,
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
    console.error('[Calendly Sync] Error:', error);
    throw error;
  }
} 