import type { BaseEntity } from './common';

/**
 * Calendar Event Types
 */
export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  attendees?: string[];
  type: EventType;
  status: EventStatus;
  source: EventSource;
  externalId?: string; // For Calendly/Google Calendar integration
  recurrence?: RecurrenceRule;
  color?: string;
  notes?: string;
  clientId?: string;
  leadId?: string;
  // Additional fields for centralized processing
  timeZone?: string;
  sourceId?: string;
  sourceUrl?: string;
  isAllDay?: boolean;
  metadata?: Record<string, any>;
}

export type EventType = 
  | 'property-viewing'
  | 'consultation'
  | 'offer-presentation'
  | 'contract-signing'
  | 'follow-up'
  | 'meeting'
  | 'appointment'
  | 'custom';

export type EventStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'no-show';

export type EventSource = 
  | 'manual'
  | 'calendly'
  | 'google-calendar'
  | 'ai-scheduled'
  | 'imported';

// Alias for backward compatibility
export type CalendarSource = EventSource;

/**
 * Availability Management
 */
export interface AvailabilitySlot extends BaseEntity {
  startTime: Date;
  endTime: Date;
  type: AvailabilityType;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  isActive: boolean;
  notes?: string;
}

export type AvailabilityType = 
  | 'available'
  | 'busy'
  | 'blocked'
  | 'preferred'
  | 'unavailable';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  endAfterOccurrences?: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number;
  monthOfYear?: number;
}

/**
 * Calendar Integration Settings
 */
export interface CalendarIntegration extends BaseEntity {
  type: 'calendly' | 'google-calendar';
  name: string;
  isActive: boolean;
  settings: CalendlySettings | GoogleCalendarSettings;
  lastSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  errorMessage?: string;
}

export interface CalendlySettings {
  apiKey: string;
  webhookUrl?: string;
  eventTypes: CalendlyEventType[];
  autoSync: boolean;
  syncInterval: number; // minutes
}

export interface GoogleCalendarSettings {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  accessToken?: string;
  calendarId: string;
  autoSync: boolean;
  syncInterval: number; // minutes
  eventTypes: GoogleEventType[];
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  duration: number; // minutes
  isActive: boolean;
  color?: string;
}

export interface GoogleEventType {
  id: string;
  name: string;
  color?: string;
  isActive: boolean;
}

/**
 * AI Scheduling
 */
export interface AISchedulingPreferences {
  preferredDuration: number; // minutes
  preferredTimes: TimeSlot[];
  bufferTime: number; // minutes before/after events
  maxEventsPerDay: number;
  autoConfirm: boolean;
  requireConfirmation: boolean;
  blackoutDates: Date[];
  blackoutTimes: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
}

export interface AvailableTimeSlot {
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  isPreferred: boolean;
  conflicts: string[]; // IDs of conflicting events
}

/**
 * Calendar Views and Filters
 */
export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  currentDate: Date;
  events: CalendarEvent[];
  availability: AvailabilitySlot[];
}

export interface CalendarFilters {
  eventTypes?: EventType[];
  statuses?: EventStatus[];
  sources?: EventSource[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  attendees?: string[];
  location?: string;
}

/**
 * API Response Types
 */
export interface CalendarApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface EventsResponse {
  events: CalendarEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface AvailabilityResponse {
  slots: AvailableTimeSlot[];
  total: number;
}

export interface IntegrationSyncResponse {
  syncedEvents: number;
  syncedAvailability: number;
  errors: string[];
  lastSync: Date;
}

/**
 * Calendar Statistics
 */
export interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  averageEventDuration: number;
  mostCommonEventType: EventType;
  busiestDay: string;
  availabilityUtilization: number; // percentage
}

/**
 * Export/Import Types
 */
export interface CalendarExport {
  events: CalendarEvent[];
  availability: AvailabilitySlot[];
  integrations: CalendarIntegration[];
  preferences: AISchedulingPreferences;
  exportDate: Date;
  version: string;
}

export interface CalendarImport {
  events?: Partial<CalendarEvent>[];
  availability?: Partial<AvailabilitySlot>[];
  integrations?: Partial<CalendarIntegration>[];
  preferences?: Partial<AISchedulingPreferences>;
  importOptions: {
    overwriteExisting: boolean;
    skipDuplicates: boolean;
    validateData: boolean;
  };
} 