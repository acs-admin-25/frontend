import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { apiClient } from '@/lib/api/client';
import type { 
  CalendarEvent, 
  AvailabilitySlot, 
  CalendarFilters,
  EventsResponse,
  AvailabilityResponse,
  CalendarApiResponse,
  EventType,
  EventStatus,
  EventSource
} from '@/types/calendar';

/**
 * GET /api/calendar
 * Retrieve calendar events and availability
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
    const filters: CalendarFilters = {
      eventTypes: searchParams.get('eventTypes')?.split(',') as EventType[],
      statuses: searchParams.get('statuses')?.split(',') as EventStatus[],
      sources: searchParams.get('sources')?.split(',') as EventSource[],
      search: searchParams.get('search') || undefined,
      attendees: searchParams.get('attendees')?.split(','),
      location: searchParams.get('location') || undefined,
    };

    // Parse date range if provided
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get events from database
    const eventsResponse = await apiClient.dbSelect({
      table_name: 'CalendarEvents',
      index_name: 'user-email-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    if (!eventsResponse.success) {
      throw new Error(eventsResponse.error || 'Failed to fetch events');
    }

    // Get availability slots
    const availabilityResponse = await apiClient.dbSelect({
      table_name: 'AvailabilitySlots',
      index_name: 'user-email-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    if (!availabilityResponse.success) {
      throw new Error(availabilityResponse.error || 'Failed to fetch availability');
    }

    const events = eventsResponse.data?.items || [];
    const availability = availabilityResponse.data?.items || [];

    // Apply filters client-side for now
    const filteredEvents = applyEventFilters(events, filters);
    const filteredAvailability = applyAvailabilityFilters(availability, filters);

    const response: EventsResponse = {
      events: filteredEvents.map(processEventData),
      total: filteredEvents.length,
      page,
      limit,
    };

    return NextResponse.json({
      success: true,
      data: response,
      availability: filteredAvailability.map(processAvailabilityData),
      status: 200,
    });

  } catch (error) {
    console.error('[Calendar API] GET error:', error);
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
 * POST /api/calendar
 * Create new calendar event or availability slot
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
    const { type, data } = body;

    if (type === 'event') {
      return await createEvent(session.user.email, data);
    } else if (type === 'availability') {
      return await createAvailability(session.user.email, data);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type specified', status: 400 },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Calendar API] POST error:', error);
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
 * PUT /api/calendar
 * Update existing calendar event or availability slot
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

    const body = await request.json();
    const { type, id, data } = body;

    if (type === 'event') {
      return await updateEvent(session.user.email, id, data);
    } else if (type === 'availability') {
      return await updateAvailability(session.user.email, id, data);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type specified', status: 400 },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Calendar API] PUT error:', error);
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
 * DELETE /api/calendar
 * Delete calendar event or availability slot
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and ID are required', status: 400 },
        { status: 400 }
      );
    }

    if (type === 'event') {
      return await deleteEvent(session.user.email, id);
    } else if (type === 'availability') {
      return await deleteAvailability(session.user.email, id);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type specified', status: 400 },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Calendar API] DELETE error:', error);
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

// Helper functions
async function createEvent(userEmail: string, eventData: Partial<CalendarEvent>) {
  const event = {
    ...eventData,
    user_email: userEmail,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const response = await apiClient.dbUpdate({
    table_name: 'CalendarEvents',
    index_name: 'id-index',
    key_name: 'id',
    key_value: eventData.id || crypto.randomUUID(),
    update_data: event,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to create event');
  }

  return NextResponse.json({
    success: true,
    data: processEventData(response.data),
    status: 201,
  });
}

async function createAvailability(userEmail: string, availabilityData: Partial<AvailabilitySlot>) {
  const availability = {
    ...availabilityData,
    user_email: userEmail,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const response = await apiClient.dbUpdate({
    table_name: 'AvailabilitySlots',
    index_name: 'id-index',
    key_name: 'id',
    key_value: availabilityData.id || crypto.randomUUID(),
    update_data: availability,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to create availability slot');
  }

  return NextResponse.json({
    success: true,
    data: processAvailabilityData(response.data),
    status: 201,
  });
}

async function updateEvent(userEmail: string, eventId: string, eventData: Partial<CalendarEvent>) {
  const response = await apiClient.dbUpdate({
    table_name: 'CalendarEvents',
    index_name: 'id-index',
    key_name: 'id',
    key_value: eventId,
    update_data: {
      ...eventData,
      updated_at: new Date().toISOString(),
    },
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to update event');
  }

  return NextResponse.json({
    success: true,
    data: processEventData(response.data),
    status: 200,
  });
}

async function updateAvailability(userEmail: string, slotId: string, availabilityData: Partial<AvailabilitySlot>) {
  const response = await apiClient.dbUpdate({
    table_name: 'AvailabilitySlots',
    index_name: 'id-index',
    key_name: 'id',
    key_value: slotId,
    update_data: {
      ...availabilityData,
      updated_at: new Date().toISOString(),
    },
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to update availability slot');
  }

  return NextResponse.json({
    success: true,
    data: processAvailabilityData(response.data),
    status: 200,
  });
}

async function deleteEvent(userEmail: string, eventId: string) {
  const response = await apiClient.dbDelete({
    table_name: 'CalendarEvents',
    attribute_name: 'id',
    attribute_value: eventId,
    is_primary_key: true,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete event');
  }

  return NextResponse.json({
    success: true,
    message: 'Event deleted successfully',
    status: 200,
  });
}

async function deleteAvailability(userEmail: string, slotId: string) {
  const response = await apiClient.dbDelete({
    table_name: 'AvailabilitySlots',
    attribute_name: 'id',
    attribute_value: slotId,
    is_primary_key: true,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete availability slot');
  }

  return NextResponse.json({
    success: true,
    message: 'Availability slot deleted successfully',
    status: 200,
  });
}

function applyEventFilters(events: any[], filters: CalendarFilters): any[] {
  return events.filter(event => {
    if (filters.eventTypes?.length && !filters.eventTypes.includes(event.event_type)) {
      return false;
    }
    if (filters.statuses?.length && !filters.statuses.includes(event.status)) {
      return false;
    }
    if (filters.sources?.length && !filters.sources.includes(event.source)) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!event.title?.toLowerCase().includes(searchLower) && 
          !event.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.dateRange) {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      if (eventStart < filters.dateRange.start || eventEnd > filters.dateRange.end) {
        return false;
      }
    }
    return true;
  });
}

function applyAvailabilityFilters(availability: any[], filters: CalendarFilters): any[] {
  return availability.filter(slot => {
    if (filters.dateRange) {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      if (slotStart < filters.dateRange.start || slotEnd > filters.dateRange.end) {
        return false;
      }
    }
    return true;
  });
}

function processEventData(data: any): CalendarEvent {
  return {
    ...data,
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function processAvailabilityData(data: any): AvailabilitySlot {
  return {
    ...data,
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
} 