import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { apiClient } from '@/lib/api/client';
import type { 
  AvailabilitySlot, 
  AvailableTimeSlot,
  AISchedulingPreferences,
  TimeSlot,
  AvailabilityResponse 
} from '@/types/calendar';

/**
 * GET /api/calendar/availability
 * Get availability slots and AI scheduling preferences
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
    const action = searchParams.get('action');

    if (action === 'available-slots') {
      return await getAvailableTimeSlots(session.user.email, request);
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

    // Get AI scheduling preferences
    const preferencesResponse = await apiClient.dbSelect({
      table_name: 'AISchedulingPreferences',
      index_name: 'user-email-index',
      key_name: 'user_email',
      key_value: session.user.email,
    });

    const availability = availabilityResponse.data?.items || [];
    const preferences = preferencesResponse.data?.items?.[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        availability: availability.map(processAvailabilityData),
        preferences: preferences ? processPreferencesData(preferences) : null,
      },
      status: 200,
    });

  } catch (error) {
    console.error('[Availability API] GET error:', error);
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
 * POST /api/calendar/availability
 * Create availability slots or update AI scheduling preferences
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

    if (type === 'slot') {
      return await createAvailabilitySlot(session.user.email, data);
    } else if (type === 'preferences') {
      return await updateAISchedulingPreferences(session.user.email, data);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type specified', status: 400 },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Availability API] POST error:', error);
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
 * PUT /api/calendar/availability
 * Update availability slots or AI scheduling preferences
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

    if (type === 'slot') {
      return await updateAvailabilitySlot(session.user.email, id, data);
    } else if (type === 'preferences') {
      return await updateAISchedulingPreferences(session.user.email, data);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type specified', status: 400 },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Availability API] PUT error:', error);
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
 * DELETE /api/calendar/availability
 * Delete availability slots
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
    const slotId = searchParams.get('id');

    if (!slotId) {
      return NextResponse.json(
        { success: false, error: 'Slot ID is required', status: 400 },
        { status: 400 }
      );
    }

    return await deleteAvailabilitySlot(session.user.email, slotId);

  } catch (error) {
    console.error('[Availability API] DELETE error:', error);
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
async function createAvailabilitySlot(userEmail: string, slotData: Partial<AvailabilitySlot>) {
  const slot = {
    ...slotData,
    user_email: userEmail,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const response = await apiClient.dbUpdate({
    table_name: 'AvailabilitySlots',
    index_name: 'id-index',
    key_name: 'id',
    key_value: slotData.id || crypto.randomUUID(),
    update_data: slot,
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

async function updateAvailabilitySlot(userEmail: string, slotId: string, slotData: Partial<AvailabilitySlot>) {
  const response = await apiClient.dbUpdate({
    table_name: 'AvailabilitySlots',
    index_name: 'id-index',
    key_name: 'id',
    key_value: slotId,
    update_data: {
      ...slotData,
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

async function deleteAvailabilitySlot(userEmail: string, slotId: string) {
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

async function updateAISchedulingPreferences(userEmail: string, preferencesData: Partial<AISchedulingPreferences>) {
  // Get existing preferences or create new ones
  const preferencesResponse = await apiClient.dbSelect({
    table_name: 'AISchedulingPreferences',
    index_name: 'user-email-index',
    key_name: 'user_email',
    key_value: userEmail,
  });

  let preferencesId: string;
  let existingPreferences: any = null;

  if (preferencesResponse.success && preferencesResponse.data?.items) {
    existingPreferences = preferencesResponse.data.items[0];
  }

  if (existingPreferences) {
    preferencesId = existingPreferences.id;
  } else {
    preferencesId = crypto.randomUUID();
  }

  const preferences = {
    ...preferencesData,
    user_email: userEmail,
    created_at: existingPreferences?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const response = await apiClient.dbUpdate({
    table_name: 'AISchedulingPreferences',
    index_name: 'id-index',
    key_name: 'id',
    key_value: preferencesId,
    update_data: preferences,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to update AI scheduling preferences');
  }

  return NextResponse.json({
    success: true,
    data: processPreferencesData(response.data),
    message: existingPreferences ? 'Preferences updated successfully' : 'Preferences created successfully',
    status: 200,
  });
}

async function getAvailableTimeSlots(userEmail: string, request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const duration = parseInt(searchParams.get('duration') || '120'); // Default 2 hours

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required', status: 400 },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all events and availability slots for the date range
    const eventsResponse = await apiClient.dbSelect({
      table_name: 'CalendarEvents',
      index_name: 'user-email-index',
      key_name: 'user_email',
      key_value: userEmail,
    });

    const availabilityResponse = await apiClient.dbSelect({
      table_name: 'AvailabilitySlots',
      index_name: 'user-email-index',
      key_name: 'user_email',
      key_value: userEmail,
    });

    if (!eventsResponse.success || !availabilityResponse.success) {
      throw new Error('Failed to fetch calendar data');
    }

    const events = eventsResponse.data?.items || [];
    const availability = availabilityResponse.data?.items || [];

    // Get AI scheduling preferences
    const preferencesResponse = await apiClient.dbSelect({
      table_name: 'AISchedulingPreferences',
      index_name: 'user-email-index',
      key_name: 'user_email',
      key_value: userEmail,
    });

    const preferences = preferencesResponse.data?.items?.[0] || null;

    // Calculate available time slots
    const availableSlots = calculateAvailableSlots(
      start,
      end,
      duration,
      events,
      availability,
      preferences
    );

    const response: AvailabilityResponse = {
      slots: availableSlots,
      total: availableSlots.length,
    };

    return NextResponse.json({
      success: true,
      data: response,
      status: 200,
    });

  } catch (error) {
    console.error('[Available Time Slots] Error:', error);
    throw error;
  }
}

function calculateAvailableSlots(
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  events: any[],
  availability: any[],
  preferences: any
): AvailableTimeSlot[] {
  const availableSlots: AvailableTimeSlot[] = [];
  const currentDate = new Date(startDate);

  // Default working hours if no preferences
  const defaultStartTime = 9; // 9 AM
  const defaultEndTime = 17; // 5 PM
  const bufferTime = preferences?.buffer_time || 15; // 15 minutes buffer

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Skip weekends if no preferences specified
    if (!preferences?.preferred_times && (dayOfWeek === 0 || dayOfWeek === 6)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Get time slots for this day
    const daySlots = getDayTimeSlots(
      currentDate,
      durationMinutes,
      events,
      availability,
      preferences,
      defaultStartTime,
      defaultEndTime,
      bufferTime
    );

    availableSlots.push(...daySlots);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availableSlots;
}

function getDayTimeSlots(
  date: Date,
  durationMinutes: number,
  events: any[],
  availability: any[],
  preferences: any,
  defaultStartTime: number,
  defaultEndTime: number,
  bufferTime: number
): AvailableTimeSlot[] {
  const slots: AvailableTimeSlot[] = [];
  const dayStart = new Date(date);
  const dayEnd = new Date(date);

  // Set working hours based on preferences or defaults
  if (preferences?.preferred_times) {
    const dayPreferences = preferences.preferred_times.find(
      (timeSlot: TimeSlot) => timeSlot.daysOfWeek.includes(date.getDay())
    );
    
    if (dayPreferences) {
      const [startHour, startMinute] = dayPreferences.startTime.split(':').map(Number);
      const [endHour, endMinute] = dayPreferences.endTime.split(':').map(Number);
      
      dayStart.setHours(startHour, startMinute, 0, 0);
      dayEnd.setHours(endHour, endMinute, 0, 0);
    } else {
      dayStart.setHours(defaultStartTime, 0, 0, 0);
      dayEnd.setHours(defaultEndTime, 0, 0, 0);
    }
  } else {
    dayStart.setHours(defaultStartTime, 0, 0, 0);
    dayEnd.setHours(defaultEndTime, 0, 0, 0);
  }

  // Get events for this day
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate.toDateString() === date.toDateString();
  });

  // Get availability for this day
  const dayAvailability = availability.filter(slot => {
    const slotDate = new Date(slot.start_time);
    return slotDate.toDateString() === date.toDateString();
  });

  // Generate time slots
  let currentTime = new Date(dayStart);
  
  while (currentTime < dayEnd) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
    
    if (slotEnd <= dayEnd) {
      // Check if this slot conflicts with any events
      const conflicts = dayEvents.filter(event => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);
        return (
          (currentTime < eventEnd && slotEnd > eventStart) ||
          (eventStart < slotEnd && eventEnd > currentTime)
        );
      });

      // Check if this slot conflicts with any availability blocks
      const availabilityConflicts = dayAvailability.filter(slot => {
        const slotStart = new Date(slot.start_time);
        const slotEndTime = new Date(slot.end_time);
        return (
          slot.type === 'busy' || slot.type === 'blocked' ||
          (currentTime < slotEndTime && slotEnd > slotStart) ||
          (slotStart < slotEnd && slotEndTime > currentTime)
        );
      });

      if (conflicts.length === 0 && availabilityConflicts.length === 0) {
        // Check if this is a preferred time slot
        const isPreferred = preferences?.preferred_times?.some((timeSlot: TimeSlot) => {
          if (!timeSlot.daysOfWeek.includes(date.getDay())) return false;
          
          const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
          const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);
          
          const preferredStart = new Date(date);
          preferredStart.setHours(startHour, startMinute, 0, 0);
          
          const preferredEnd = new Date(date);
          preferredEnd.setHours(endHour, endMinute, 0, 0);
          
          return currentTime >= preferredStart && slotEnd <= preferredEnd;
        }) || false;

        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          duration: durationMinutes,
          isPreferred,
          conflicts: [],
        });
      }
    }
    
    // Move to next slot (with buffer time)
    currentTime.setMinutes(currentTime.getMinutes() + bufferTime);
  }

  return slots;
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

function processPreferencesData(data: any): AISchedulingPreferences {
  return {
    ...data,
    blackoutDates: data.blackout_dates?.map((date: string) => new Date(date)) || [],
    blackoutTimes: data.blackout_times || [],
    preferredTimes: data.preferred_times || [],
  };
} 