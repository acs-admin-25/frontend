import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * POST /api/calendar/outlook/sync
 * Sync events from Outlook Calendar
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
      throw new Error('Failed to fetch integration settings');
    }

    const integrationData = await integrationResponse.json();
    const outlookIntegration = integrationData.success && integrationData.data?.items?.find(
      (integration: any) => integration.type === 'outlook-calendar'
    );

    if (!outlookIntegration) {
      throw new Error('No Outlook Calendar integration found');
    }

    const settings = outlookIntegration.settings;

    if (!settings.accessToken) {
      throw new Error('No access token available. Please complete OAuth authentication first.');
    }

    // Check if token is expired
    if (settings.expiresAt && new Date(settings.expiresAt) < new Date()) {
      throw new Error('Access token has expired. Please reconnect your Outlook Calendar.');
    }

    // Update sync status
    await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        table_name: 'CalendarIntegrations',
        index_name: 'id-index',
        key_name: 'id',
        key_value: outlookIntegration.id,
        update_data: {
          sync_status: 'syncing',
          updated_at: new Date().toISOString(),
        },
      }),
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
      const errorText = await graphResponse.text();
      throw new Error(`Failed to fetch events from Outlook Calendar: ${errorText}`);
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
          startTime: new Date(event.start.dateTime).toISOString(),
          endTime: new Date(event.end.dateTime).toISOString(),
          allDay: event.isAllDay || false,
          location: event.location?.displayName || '',
          attendees: event.attendees?.map((a: any) => a.emailAddress?.address).filter(Boolean) || [],
          type: 'meeting',
          status: 'scheduled',
          source: 'outlook-calendar',
          externalId: event.id,
          user_email: session.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Save event to database
        const saveResponse = await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            table_name: 'CalendarEvents',
            index_name: 'id-index',
            key_name: 'id',
            key_value: calendarEvent.id,
            update_data: calendarEvent,
          }),
        });

        if (saveResponse.ok) {
          syncedEvents++;
        } else {
          errors.push(`Failed to save event: ${event.subject}`);
        }
      } catch (error) {
        errors.push(`Error processing event: ${event.subject}`);
      }
    }

    // Update sync status
    await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        table_name: 'CalendarIntegrations',
        index_name: 'id-index',
        key_name: 'id',
        key_value: outlookIntegration.id,
        update_data: {
          sync_status: errors.length > 0 ? 'error' : 'idle',
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    });

    return NextResponse.json({
      success: true,
      data: {
        syncedEvents,
        errors,
        lastSync: new Date(),
        totalEvents: events.length,
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