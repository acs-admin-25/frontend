import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent, CalendarFilters } from '@/types/calendar';

export interface CalendarData {
  events: CalendarEvent[];
  googleEvents: CalendarEvent[];
  calendlyEvents: CalendarEvent[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    upcoming: number;
    past: number;
    sourceBreakdown: Record<string, number>;
    nextEvent: CalendarEvent | null;
    lastEvent: CalendarEvent | null;
  };
}

export interface UseCalendarDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: CalendarFilters;
  enableGoogle?: boolean;
  enableCalendly?: boolean;
}

/**
 * Centralized calendar data hook
 * Uses API routes instead of direct calendar client to avoid Node.js dependencies
 */
export function useCalendarData(options: UseCalendarDataOptions = {}): CalendarData & {
  refetch: () => Promise<void>;
  refreshGoogleEvents: () => Promise<void>;
  refreshCalendlyEvents: () => Promise<void>;
  createEvent: (eventData: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
} {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    filters = {},
    enableGoogle = true,
    enableCalendly = true
  } = options;

  const [data, setData] = useState<CalendarData>({
    events: [],
    googleEvents: [],
    calendlyEvents: [],
    loading: true,
    error: null,
    stats: {
      total: 0,
      upcoming: 0,
      past: 0,
      sourceBreakdown: {},
      nextEvent: null,
      lastEvent: null
    }
  });

  /**
   * Calculate calendar statistics
   */
  const calculateStats = useCallback((events: CalendarEvent[]) => {
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
  }, []);

  /**
   * Apply filters to events
   */
  const applyFilters = useCallback((events: CalendarEvent[], filters: CalendarFilters): CalendarEvent[] => {
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
  }, []);

  /**
   * Fetch calendar events from API
   */
  const fetchCalendarEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
      if (filters.sources?.length) {
        params.append('sources', filters.sources.join(','));
      }
      if (filters.statuses?.length) {
        params.append('statuses', filters.statuses.join(','));
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.attendees?.length) {
        params.append('attendees', filters.attendees.join(','));
      }
      if (filters.location) {
        params.append('location', filters.location);
      }

      const response = await fetch(`/api/calendar?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        return result.data.events || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }, [filters]);

  /**
   * Fetch Google Calendar events from API
   */
  const fetchGoogleEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!enableGoogle) return [];

    try {
      const response = await fetch('/api/calendar/google?events=true');
      const result = await response.json();

      if (result.success && result.data) {
        return result.data.events || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
      return [];
    }
  }, [enableGoogle]);

  /**
   * Fetch Calendly events from API
   */
  const fetchCalendlyEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!enableCalendly) return [];

    try {
      const response = await fetch('/api/calendar/calendly?events=true');
      const result = await response.json();

      if (result.success && result.data) {
        return result.data.events || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch Calendly events:', error);
      return [];
    }
  }, [enableCalendly]);

  /**
   * Refresh all calendar data
   */
  const refetch = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [events, googleEvents, calendlyEvents] = await Promise.all([
        fetchCalendarEvents(),
        fetchGoogleEvents(),
        fetchCalendlyEvents()
      ]);

      const allEvents = [...events, ...googleEvents, ...calendlyEvents];
      const filteredEvents = applyFilters(allEvents, filters);
      const stats = calculateStats(filteredEvents);

      setData({
        events: filteredEvents,
        googleEvents,
        calendlyEvents,
        loading: false,
        error: null,
        stats
      });
    } catch (error) {
      console.error('Failed to refetch calendar data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load calendar data'
      }));
    }
  }, [fetchCalendarEvents, fetchGoogleEvents, fetchCalendlyEvents, applyFilters, calculateStats, filters]);

  /**
   * Refresh Google Calendar events
   */
  const refreshGoogleEvents = useCallback(async () => {
    try {
      const googleEvents = await fetchGoogleEvents();
      setData(prev => ({
        ...prev,
        googleEvents,
        stats: calculateStats([...prev.events, ...googleEvents, ...prev.calendlyEvents])
      }));
    } catch (error) {
      console.error('Failed to refresh Google events:', error);
    }
  }, [fetchGoogleEvents, calculateStats]);

  /**
   * Refresh Calendly events
   */
  const refreshCalendlyEvents = useCallback(async () => {
    try {
      const calendlyEvents = await fetchCalendlyEvents();
      setData(prev => ({
        ...prev,
        calendlyEvents,
        stats: calculateStats([...prev.events, ...prev.googleEvents, ...calendlyEvents])
      }));
    } catch (error) {
      console.error('Failed to refresh Calendly events:', error);
    }
  }, [fetchCalendlyEvents, calculateStats]);

  /**
   * Create new event
   */
  const createEvent = useCallback(async (eventData: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'event',
          data: eventData
        })
      });

      const result = await response.json();
      if (result.success && result.data) {
        // Refresh data after creating event
        await refetch();
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create event:', error);
      return null;
    }
  }, [refetch]);

  // Initial data fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refetch, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Update data when filters change
  useEffect(() => {
    if (!data.loading) {
      const filteredEvents = applyFilters([...data.events, ...data.googleEvents, ...data.calendlyEvents], filters);
      const stats = calculateStats(filteredEvents);
      setData(prev => ({ ...prev, events: filteredEvents, stats }));
    }
  }, [filters, data.loading, data.events, data.googleEvents, data.calendlyEvents, applyFilters, calculateStats]);

  return {
    ...data,
    refetch,
    refreshGoogleEvents,
    refreshCalendlyEvents,
    createEvent
  };
} 