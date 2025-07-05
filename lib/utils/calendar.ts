import type { 
  CalendarEvent, 
  AvailabilitySlot, 
  AvailableTimeSlot,
  TimeSlot,
  EventType,
  EventStatus,
  CalendarSource,
  CalendarFilters,
  EventsResponse,
  AvailabilityResponse,
  CalendarApiResponse,
  EventSource
} from '@/types/calendar';

/**
 * Date and Time Utilities
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'time':
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case 'datetime':
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    default:
      return date.toLocaleDateString();
  }
}

export function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay()); // Start from Sunday

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }

  return days;
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Add days from previous month to fill first week
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // Add all days (42 total for 6 weeks)
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isPast(date: Date): boolean {
  return date < new Date();
}

export function isFuture(date: Date): boolean {
  return date > new Date();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Event Utilities
 */
export function getEventDuration(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
}

export function formatEventDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function getEventColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    'property-viewing': '#3b82f6', // blue
    'consultation': '#8b5cf6', // purple
    'offer-presentation': '#10b981', // green
    'contract-signing': '#f59e0b', // amber
    'follow-up': '#f97316', // orange
    'meeting': '#06b6d4', // cyan
    'appointment': '#0e6537', // ACS green
    'custom': '#6b7280', // gray
  };
  return colors[type] || colors.custom;
}

export function getEventStatusColor(status: EventStatus): string {
  const colors: Record<EventStatus, string> = {
    'scheduled': '#6b7280', // gray
    'confirmed': '#10b981', // green
    'pending': '#f59e0b', // amber
    'cancelled': '#ef4444', // red
    'completed': '#3b82f6', // blue
    'no-show': '#dc2626', // red
  };
  return colors[status] || colors.scheduled;
}

export function getEventStatusIcon(status: EventStatus): string {
  const icons: Record<EventStatus, string> = {
    'scheduled': '📅',
    'confirmed': '✅',
    'pending': '⏳',
    'cancelled': '❌',
    'completed': '✅',
    'no-show': '🚫',
  };
  return icons[status] || icons.scheduled;
}

/**
 * Availability Utilities
 */
export function calculateAvailableSlots(
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  events: CalendarEvent[],
  availability: AvailabilitySlot[],
  preferences?: any
): AvailableTimeSlot[] {
  const slots: AvailableTimeSlot[] = [];
  const currentDate = new Date(startDate);

  // Default working hours if no preferences
  const defaultStartTime = 9; // 9 AM
  const defaultEndTime = 17; // 5 PM
  const bufferTime = preferences?.bufferTime || 15; // 15 minutes buffer

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Skip weekends if no preferences specified
    if (!preferences?.preferredTimes && (dayOfWeek === 0 || dayOfWeek === 6)) {
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

    slots.push(...daySlots);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

function getDayTimeSlots(
  date: Date,
  durationMinutes: number,
  events: CalendarEvent[],
  availability: AvailabilitySlot[],
  preferences: any,
  defaultStartTime: number,
  defaultEndTime: number,
  bufferTime: number
): AvailableTimeSlot[] {
  const slots: AvailableTimeSlot[] = [];
  const dayStart = new Date(date);
  const dayEnd = new Date(date);

  // Set working hours based on preferences or defaults
  if (preferences?.preferredTimes) {
    const dayPreferences = preferences.preferredTimes.find(
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
    const eventDate = new Date(event.startTime);
    return isSameDay(eventDate, date);
  });

  // Get availability for this day
  const dayAvailability = availability.filter(slot => {
    const slotDate = new Date(slot.startTime);
    return isSameDay(slotDate, date);
  });

  // Generate time slots
  let currentTime = new Date(dayStart);
  
  while (currentTime < dayEnd) {
    const slotEnd = addMinutes(currentTime, durationMinutes);
    
    if (slotEnd <= dayEnd) {
      // Check if this slot conflicts with any events
      const conflicts = dayEvents.filter(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        return (
          (currentTime < eventEnd && slotEnd > eventStart) ||
          (eventStart < slotEnd && eventEnd > currentTime)
        );
      });

      // Check if this slot conflicts with any availability blocks
      const availabilityConflicts = dayAvailability.filter(slot => {
        const slotStart = new Date(slot.startTime);
        const slotEndTime = new Date(slot.endTime);
        return (
          slot.type === 'busy' || slot.type === 'blocked' ||
          (currentTime < slotEndTime && slotEnd > slotStart) ||
          (slotStart < slotEnd && slotEndTime > currentTime)
        );
      });

      if (conflicts.length === 0 && availabilityConflicts.length === 0) {
        // Check if this is a preferred time slot
        const isPreferred = preferences?.preferredTimes?.some((timeSlot: TimeSlot) => {
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
    currentTime = addMinutes(currentTime, bufferTime);
  }

  return slots;
}

/**
 * Recurrence Utilities
 */
export function generateRecurringDates(
  startDate: Date,
  endDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  daysOfWeek?: number[],
  endAfterOccurrences?: number
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  let occurrenceCount = 0;

  while (currentDate <= endDate && (!endAfterOccurrences || occurrenceCount < endAfterOccurrences)) {
    if (frequency === 'daily') {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, interval);
    } else if (frequency === 'weekly') {
      if (!daysOfWeek || daysOfWeek.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, interval * 7);
    } else if (frequency === 'monthly') {
      dates.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + interval);
    } else if (frequency === 'yearly') {
      dates.push(new Date(currentDate));
      currentDate.setFullYear(currentDate.getFullYear() + interval);
    }

    occurrenceCount++;
  }

  return dates;
}

/**
 * Validation Utilities
 */
export function validateEventData(eventData: Partial<CalendarEvent>): string[] {
  const errors: string[] = [];

  if (!eventData.title?.trim()) {
    errors.push('Event title is required');
  }

  if (!eventData.startTime) {
    errors.push('Start time is required');
  }

  if (!eventData.endTime) {
    errors.push('End time is required');
  }

  if (eventData.startTime && eventData.endTime) {
    const start = new Date(eventData.startTime);
    const end = new Date(eventData.endTime);
    
    if (start >= end) {
      errors.push('End time must be after start time');
    }
  }

  return errors;
}

export function validateAvailabilityData(slotData: Partial<AvailabilitySlot>): string[] {
  const errors: string[] = [];

  if (!slotData.startTime) {
    errors.push('Start time is required');
  }

  if (!slotData.endTime) {
    errors.push('End time is required');
  }

  if (slotData.startTime && slotData.endTime) {
    const start = new Date(slotData.startTime);
    const end = new Date(slotData.endTime);
    
    if (start >= end) {
      errors.push('End time must be after start time');
    }
  }

  if (!slotData.type) {
    errors.push('Availability type is required');
  }

  return errors;
}

/**
 * Export/Import Utilities
 */
export function exportCalendarData(
  events: CalendarEvent[],
  availability: AvailabilitySlot[],
  integrations: any[],
  preferences: any
): string {
  const exportData = {
    events,
    availability,
    integrations,
    preferences,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };

  return JSON.stringify(exportData, null, 2);
}

export function parseCalendarImport(data: string): any {
  try {
    const parsed = JSON.parse(data);
    
    // Validate required fields
    if (!parsed.events || !Array.isArray(parsed.events)) {
      throw new Error('Invalid events data');
    }

    if (!parsed.availability || !Array.isArray(parsed.availability)) {
      throw new Error('Invalid availability data');
    }

    return parsed;
  } catch (error) {
    throw new Error('Invalid calendar data format');
  }
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus?: string;
  }>;
  location?: string;
  colorId?: string;
  htmlLink?: string;
  created: string;
  updated: string;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: {
    uri: string;
    name: string;
    description?: string;
  };
  location?: {
    type: string;
    location: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CalendarIntegration {
  id: string;
  type: 'google' | 'calendly';
  name: string;
  isActive: boolean;
  settings: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    calendarId?: string;
    eventTypes?: string[];
    autoSync?: boolean;
    syncInterval?: number;
  };
  lastSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Centralized processing function for Google Calendar events
 * Follows the established data flow pattern
 */
export function processGoogleCalendarEvents(rawEvents: GoogleCalendarEvent[]): CalendarEvent[] {
  if (!Array.isArray(rawEvents)) return [];
  
  return rawEvents
    .filter(event => event && typeof event === 'object')
    .map(event => {
      try {
        return {
          id: event.id,
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          startTime: new Date(event.start.dateTime || event.start.date || ''),
          endTime: new Date(event.end.dateTime || event.end.date || ''),
          allDay: !event.start.dateTime,
          timeZone: event.start.timeZone || 'UTC',
          location: event.location || '',
          attendees: event.attendees?.map(attendee => attendee.email) || [],
          type: 'meeting' as EventType,
          status: 'confirmed' as EventStatus,
          source: 'google-calendar' as EventSource,
          externalId: event.id,
          color: event.colorId || 'default',
          sourceId: event.id,
          sourceUrl: event.htmlLink || '',
          isAllDay: !event.start.dateTime,
          createdAt: new Date(event.created),
          updatedAt: new Date(event.updated),
          metadata: {
            googleCalendarId: event.id,
            colorId: event.colorId
          }
        };
      } catch (error) {
        console.error('Error processing Google Calendar event:', error, event);
        return null;
      }
    })
    .filter((event): event is CalendarEvent => event !== null);
}

/**
 * Centralized processing function for Calendly events
 * Follows the established data flow pattern
 */
export function processCalendlyEvents(rawEvents: CalendlyEvent[]): CalendarEvent[] {
  if (!Array.isArray(rawEvents)) return [];
  
  return rawEvents
    .filter(event => event && typeof event === 'object')
    .map(event => {
      try {
        return {
          id: event.uri.split('/').pop() || crypto.randomUUID(),
          title: event.name || event.event_type.name || 'Untitled Event',
          description: event.event_type.description || '',
          startTime: new Date(event.start_time),
          endTime: new Date(event.end_time),
          allDay: false,
          timeZone: 'UTC', // Calendly events are typically in UTC
          location: event.location?.location || '',
          attendees: [], // Calendly doesn't provide attendee list in basic API
          type: 'appointment' as EventType,
          status: event.status as EventStatus,
          source: 'calendly' as EventSource,
          externalId: event.uri,
          sourceId: event.uri,
          sourceUrl: event.uri,
          isAllDay: false,
          createdAt: new Date(event.created_at),
          updatedAt: new Date(event.updated_at),
          metadata: {
            calendlyUri: event.uri,
            eventTypeUri: event.event_type.uri,
            inviteesCount: event.invitees_counter
          }
        };
      } catch (error) {
        console.error('Error processing Calendly event:', error, event);
        return null;
      }
    })
    .filter((event): event is CalendarEvent => event !== null);
}

/**
 * Centralized processing function for calendar events from any source
 * Combines and normalizes events from multiple sources
 */
export function processCalendarEvents(
  googleEvents: GoogleCalendarEvent[] = [],
  calendlyEvents: CalendlyEvent[] = []
): CalendarEvent[] {
  const processedGoogleEvents = processGoogleCalendarEvents(googleEvents);
  const processedCalendlyEvents = processCalendlyEvents(calendlyEvents);
  
  // Combine and sort by start time
  return [...processedGoogleEvents, ...processedCalendlyEvents]
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * Apply filters to calendar events
 * Centralized filtering logic
 */
export function applyCalendarFilters(events: CalendarEvent[], filters: CalendarFilters): CalendarEvent[] {
  return events.filter(event => {
    // Date range filter
    if (filters.dateRange) {
      const eventStart = event.startTime.getTime();
      const rangeStart = filters.dateRange.start.getTime();
      const rangeEnd = filters.dateRange.end.getTime();
      
      if (eventStart < rangeStart || eventStart > rangeEnd) {
        return false;
      }
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.includes(event.source)) {
        return false;
      }
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(event.status)) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(searchTerm);
      const matchesDescription = (event.description || '').toLowerCase().includes(searchTerm);
      const matchesLocation = (event.location || '').toLowerCase().includes(searchTerm);
      
      if (!matchesTitle && !matchesDescription && !matchesLocation) {
        return false;
      }
    }

    // Attendee filter
    if (filters.attendees && filters.attendees.length > 0) {
      const eventAttendees = (event.attendees || []).map(a => a.toLowerCase());
      const hasMatchingAttendee = filters.attendees.some(attendee => 
        eventAttendees.includes(attendee.toLowerCase())
      );
      
      if (!hasMatchingAttendee) {
        return false;
      }
    }

    // Location filter
    if (filters.location) {
      if (!(event.location || '').toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Group events by date for calendar view
 */
export function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce((groups, event) => {
    const dateKey = event.startTime.toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, CalendarEvent[]>);
}

/**
 * Get events for a specific date range
 */
export function getEventsInRange(
  events: CalendarEvent[], 
  startDate: Date, 
  endDate: Date
): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = event.startTime.getTime();
    const rangeStart = startDate.getTime();
    const rangeEnd = endDate.getTime();
    
    return eventStart >= rangeStart && eventStart <= rangeEnd;
  });
}

/**
 * Calculate calendar statistics
 */
export function calculateCalendarStats(events: CalendarEvent[]) {
  const now = new Date();
  const upcomingEvents = events.filter(event => event.startTime > now);
  const pastEvents = events.filter(event => event.startTime <= now);
  
  const sourceBreakdown = events.reduce((acc, event) => {
    acc[event.source] = (acc[event.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: events.length,
    upcoming: upcomingEvents.length,
    past: pastEvents.length,
    sourceBreakdown,
    nextEvent: upcomingEvents[0] || null,
    lastEvent: pastEvents[pastEvents.length - 1] || null
  };
} 