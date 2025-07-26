import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/calendar/google-calendar/events
 * Fetch events from Google Calendar API
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

    // Get access token from query parameter (in a real app, this would come from database)
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'No access token provided', status: 400 },
        { status: 400 }
      );
    }

    // Fetch events from Google Calendar API
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30); // Get events from 30 days ago

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 90); // Get events up to 90 days in the future

    const googleResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${startTime.toISOString()}&timeMax=${endTime.toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('[google-calendar/events] Google API error:', {
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
        { success: false, error: 'Failed to fetch events from Google Calendar', status: googleResponse.status },
        { status: googleResponse.status }
      );
    }

    const googleData = await googleResponse.json();
    const events = googleData.items || [];

    // Transform Google Calendar events to our format
    const transformedEvents = events.map((event: any) => ({
      id: event.id,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        events: transformedEvents,
        total: transformedEvents.length,
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Google Calendar Events] Error:', error);
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