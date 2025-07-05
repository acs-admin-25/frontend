import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api/client';
import type { 
  CalendarEvent, 
  AvailabilitySlot, 
  CalendarFilters,
  EventsResponse,
  AvailabilityResponse,
  CalendarIntegration,
  AISchedulingPreferences,
  AvailableTimeSlot,
  EventType,
  EventStatus,
  EventSource
} from '@/types/calendar';

interface UseCalendarReturn {
  // Events
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  
  // Availability
  availability: AvailabilitySlot[];
  availableSlots: AvailableTimeSlot[];
  
  // Integrations
  integrations: CalendarIntegration[];
  
  // Preferences
  preferences: AISchedulingPreferences | null;
  
  // Actions
  createEvent: (eventData: Partial<CalendarEvent>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  createAvailabilitySlot: (slotData: Partial<AvailabilitySlot>) => Promise<void>;
  updateAvailabilitySlot: (id: string, slotData: Partial<AvailabilitySlot>) => Promise<void>;
  deleteAvailabilitySlot: (id: string) => Promise<void>;
  
  getAvailableSlots: (startDate: Date, endDate: Date, duration?: number) => Promise<void>;
  
  // Integration actions
  setupCalendlyIntegration: (settings: any) => Promise<void>;
  setupGoogleCalendarIntegration: (settings: any) => Promise<void>;
  syncIntegration: (type: 'calendly' | 'google-calendar') => Promise<void>;
  deleteIntegration: (type: 'calendly' | 'google-calendar') => Promise<void>;
  
  // Preferences
  updatePreferences: (preferences: Partial<AISchedulingPreferences>) => Promise<void>;
  
  // Filters
  filters: CalendarFilters;
  setFilters: (filters: CalendarFilters) => void;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useCalendar(): UseCalendarReturn {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [preferences, setPreferences] = useState<AISchedulingPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({});

  // Load calendar data
  const loadCalendarData = useCallback(async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      // Load events and availability
      const calendarResponse = await apiClient.request('calendar');
      
      if (!calendarResponse.success) {
        throw new Error(calendarResponse.error || 'Failed to load calendar data');
      }

      const calendarData = calendarResponse.data as any;
      setEvents(calendarData?.events || []);
      setAvailability(calendarData?.availability || []);

      // Load integrations
      await loadIntegrations();

      // Load preferences
      await loadPreferences();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Load integrations
  const loadIntegrations = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const integrations: CalendarIntegration[] = [];

      // Load Calendly integration
      const calendlyResponse = await apiClient.request('calendar/calendly');
      if (calendlyResponse.success && calendlyResponse.data && typeof calendlyResponse.data === 'object') {
        integrations.push(calendlyResponse.data as CalendarIntegration);
      }

      // Load Google Calendar integration
      const googleResponse = await apiClient.request('calendar/google');
      if (googleResponse.success && googleResponse.data && typeof googleResponse.data === 'object') {
        integrations.push(googleResponse.data as CalendarIntegration);
      }

      setIntegrations(integrations);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    }
  }, [session?.user?.email]);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await apiClient.request('calendar/availability');
      
      if (response.success && response.data && typeof response.data === 'object') {
        const data = response.data as any;
        setPreferences(data.preferences || null);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }, [session?.user?.email]);

  // Create event
  const createEvent = useCallback(async (eventData: Partial<CalendarEvent>) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request('calendar', {
        method: 'POST',
        body: {
          type: 'event',
          data: eventData,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create event');
      }

      // Refresh events
      await loadCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadCalendarData]);

  // Update event
  const updateEvent = useCallback(async (id: string, eventData: Partial<CalendarEvent>) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request('calendar', {
        method: 'PUT',
        body: {
          type: 'event',
          id,
          data: eventData,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update event');
      }

      // Refresh events
      await loadCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadCalendarData]);

  // Delete event
  const deleteEvent = useCallback(async (id: string) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request(`calendar?type=event&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete event');
      }

      // Refresh events
      await loadCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadCalendarData]);

  // Create availability slot
  const createAvailabilitySlot = useCallback(async (slotData: Partial<AvailabilitySlot>) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request('calendar', {
        method: 'POST',
        body: {
          type: 'availability',
          data: slotData,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create availability slot');
      }

      // Refresh availability
      await loadCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create availability slot');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadCalendarData]);

  // Update availability slot
  const updateAvailabilitySlot = useCallback(async (id: string, slotData: Partial<AvailabilitySlot>) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request('calendar', {
        method: 'PUT',
        body: {
          type: 'availability',
          id,
          data: slotData,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update availability slot');
      }

      // Refresh availability
      await loadCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability slot');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadCalendarData]);

  // Delete availability slot
  const deleteAvailabilitySlot = useCallback(async (id: string) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request(`calendar?type=availability&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete availability slot');
      }

      // Refresh availability
      await loadCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete availability slot');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadCalendarData]);

  // Get available slots
  const getAvailableSlots = useCallback(async (startDate: Date, endDate: Date, duration = 120) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: 'available-slots',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: duration.toString(),
      });

      const response = await apiClient.request(`calendar/availability?${params}`);

      if (!response.success) {
        throw new Error(response.error || 'Failed to get available slots');
      }

      const responseData = response.data as any;
      setAvailableSlots(responseData?.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get available slots');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Setup Calendly integration
  const setupCalendlyIntegration = useCallback(async (settings: any) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request('calendar/calendly', {
        method: 'POST',
        body: { settings },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to setup Calendly integration');
      }

      // Refresh integrations
      await loadIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup Calendly integration');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadIntegrations]);

  // Setup Google Calendar integration
  const setupGoogleCalendarIntegration = useCallback(async (settings: any) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request('calendar/google', {
        method: 'POST',
        body: { settings },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to setup Google Calendar integration');
      }

      // Refresh integrations
      await loadIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup Google Calendar integration');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadIntegrations]);

  // Sync integration
  const syncIntegration = useCallback(async (type: 'calendly' | 'google-calendar') => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request(`calendar/${type}?action=sync`, {
        method: 'PUT',
      });

      if (!response.success) {
        throw new Error(response.error || `Failed to sync ${type} integration`);
      }

      // Refresh calendar data
      await loadCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sync ${type} integration`);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadCalendarData]);

  // Delete integration
  const deleteIntegration = useCallback(async (type: 'calendly' | 'google-calendar') => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request(`calendar/${type}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.error || `Failed to delete ${type} integration`);
      }

      // Refresh integrations
      await loadIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${type} integration`);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadIntegrations]);

  // Update preferences
  const updatePreferences = useCallback(async (preferencesData: Partial<AISchedulingPreferences>) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request('calendar/availability', {
        method: 'POST',
        body: {
          type: 'preferences',
          data: preferencesData,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update preferences');
      }

      // Refresh preferences
      await loadPreferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, loadPreferences]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadCalendarData();
  }, [loadCalendarData]);

  // Load data on mount and when session changes
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  return {
    // State
    events,
    availability,
    availableSlots,
    integrations,
    preferences,
    loading,
    error,
    filters,
    
    // Actions
    createEvent,
    updateEvent,
    deleteEvent,
    createAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
    setupCalendlyIntegration,
    setupGoogleCalendarIntegration,
    syncIntegration,
    deleteIntegration,
    updatePreferences,
    setFilters,
    refresh,
  };
} 