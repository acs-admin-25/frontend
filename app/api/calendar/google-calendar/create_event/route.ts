import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * POST /api/calendar/google-calendar/create_event
 * Create event in Google Calendar
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
    const { access_token, event } = body;

    if (!access_token) {
      return NextResponse.json(
        { success: false, error: 'No access token provided', status: 400 },
        { status: 400 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'No event data provided', status: 400 },
        { status: 400 }
      );
    }

    // Transform event data to Google Calendar format
    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime,
        timeZone: 'America/Los_Angeles', // You can make this configurable
      },
      end: {
        dateTime: event.endTime,
        timeZone: 'America/Los_Angeles',
      },
      attendees: event.attendees?.map((email: string) => ({ email })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 10 }, // 10 minutes before
        ],
      },
    };

    // Create event in Google Calendar
    const googleResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('[google-calendar/create_event] Google API error:', {
        status: googleResponse.status,
        statusText: googleResponse.statusText,
        error: errorText,
      });
      
      if (googleResponse.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Access token expired or invalid', status: 401 },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to create event in Google Calendar', status: googleResponse.status },
        { status: googleResponse.status }
      );
    }

    const googleData = await googleResponse.json();

    // Transform Google Calendar response to our format
    const createdEvent = {
      id: googleData.id,
      title: googleData.summary || 'Untitled Event',
      description: googleData.description || '',
      startTime: new Date(googleData.start.dateTime || googleData.start.date),
      endTime: new Date(googleData.end.dateTime || googleData.end.date),
      allDay: !googleData.start.dateTime,
      location: googleData.location || '',
      attendees: googleData.attendees?.map((attendee: any) => attendee.email) || [],
      type: 'appointment',
      status: googleData.status === 'confirmed' ? 'confirmed' : 'pending',
      source: 'google-calendar',
      externalId: googleData.id,
      color: googleData.colorId ? getGoogleCalendarColor(googleData.colorId) : '#0e6537',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: createdEvent,
      status: 201,
    });

  } catch (error) {
    console.error('[Google Calendar Create Event] Error:', error);
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