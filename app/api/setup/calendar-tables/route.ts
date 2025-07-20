import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * POST /api/setup/calendar-tables
 * Create calendar integration tables in the database
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

    console.log('[setup/calendar-tables] Creating calendar tables...');

    // Create CalendarIntegrations table structure
    const createIntegrationsTableResponse = await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
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
      }),
    });

    if (!createIntegrationsTableResponse.ok) {
      const errorText = await createIntegrationsTableResponse.text();
      console.error('[setup/calendar-tables] Failed to create CalendarIntegrations table:', errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create CalendarIntegrations table',
          details: errorText,
          status: 500 
        },
        { status: 500 }
      );
    }

    // Create CalendarEvents table structure
    const createEventsTableResponse = await fetch(`${process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000'}/api/db/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        table_name: 'CalendarEvents',
        index_name: 'id-index',
        key_name: 'id',
        key_value: 'table-schema',
        update_data: {
          id: 'table-schema',
          table_type: 'CalendarEvents',
          description: 'Calendar events from various integrations',
          schema: {
            id: 'string',
            title: 'string',
            description: 'string',
            startTime: 'string',
            endTime: 'string',
            allDay: 'boolean',
            location: 'string',
            attendees: 'array',
            type: 'string',
            status: 'string',
            source: 'string',
            externalId: 'string',
            user_email: 'string',
            created_at: 'string',
            updated_at: 'string'
          },
          indexes: [
            'id-index',
            'user-email-source-index',
            'source-index',
            'externalId-source-index'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    });

    if (!createEventsTableResponse.ok) {
      const errorText = await createEventsTableResponse.text();
      console.error('[setup/calendar-tables] Failed to create CalendarEvents table:', errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create CalendarEvents table',
          details: errorText,
          status: 500 
        },
        { status: 500 }
      );
    }

    console.log('[setup/calendar-tables] Successfully created calendar tables');

    return NextResponse.json({
      success: true,
      data: {
        message: 'Calendar tables created successfully',
        tables: ['CalendarIntegrations', 'CalendarEvents'],
        schema: {
          CalendarIntegrations: {
            description: 'Stores OAuth tokens and integration settings',
            key_fields: ['id', 'user_email', 'type']
          },
          CalendarEvents: {
            description: 'Stores calendar events from various sources',
            key_fields: ['id', 'user_email', 'source', 'externalId']
          }
        }
      },
      status: 200,
    });

  } catch (error) {
    console.error('[setup/calendar-tables] Error:', error);
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