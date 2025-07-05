import { google } from 'googleapis';
import type { CalendarEvent, EventSource, EventType, EventStatus } from '@/types/calendar';

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface CalendlyConfig {
  apiKey: string;
  userUri?: string;
}

export interface CalendarApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * Centralized Calendar API Client
 * Handles Google Calendar and Calendly integrations
 */
export class CalendarApiClient {
  private googleOAuth2Client: any;
  private googleConfig: GoogleCalendarConfig;
  private calendlyConfig: CalendlyConfig;

  constructor(googleConfig: GoogleCalendarConfig, calendlyConfig: CalendlyConfig) {
    this.googleConfig = googleConfig;
    this.calendlyConfig = calendlyConfig;
    
    // Initialize Google OAuth client
    this.googleOAuth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );

    // Set credentials if available
    if (googleConfig.accessToken) {
      this.googleOAuth2Client.setCredentials({
        access_token: googleConfig.accessToken,
        refresh_token: googleConfig.refreshToken
      });
    }
  }

  /**
   * Generate Google OAuth URL
   */
  generateGoogleAuthUrl(): string {
    return this.googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      prompt: 'consent'
    });
  }

  /**
   * Exchange Google authorization code for tokens
   */
  async getGoogleTokensFromCode(code: string): Promise<any> {
    const { tokens } = await this.googleOAuth2Client.getToken(code);
    this.googleOAuth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Get Google Calendar events
   */
  async getGoogleCalendarEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string
  ): Promise<CalendarApiResponse<CalendarEvent[]>> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.googleOAuth2Client });
      
      const response = await calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = (response.data.items || []).map(event => ({
        id: event.id || '',
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        startTime: new Date(event.start?.dateTime || event.start?.date || ''),
        endTime: new Date(event.end?.dateTime || event.end?.date || ''),
        allDay: !event.start?.dateTime,
        location: event.location || '',
        attendees: event.attendees?.map(a => a.email || '') || [],
        type: 'meeting' as EventType,
        status: 'confirmed' as EventStatus,
        source: 'google-calendar' as EventSource,
        externalId: event.id || '',
        color: event.colorId || 'default',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      return {
        success: true,
        data: events,
        status: 200
      };

    } catch (error) {
      console.error('Google Calendar API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Google Calendar events',
        status: 500
      };
    }
  }

  /**
   * Create Google Calendar event
   */
  async createGoogleCalendarEvent(
    eventData: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<CalendarApiResponse<CalendarEvent>> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.googleOAuth2Client });
      
      const googleEvent = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime?.toISOString(),
          timeZone: eventData.timeZone || 'UTC'
        },
        end: {
          dateTime: eventData.endTime?.toISOString(),
          timeZone: eventData.timeZone || 'UTC'
        },
        location: eventData.location,
        attendees: eventData.attendees?.map(email => ({ email }))
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: googleEvent,
      });

      const createdEvent = {
        ...eventData,
        id: response.data.id || '',
        externalId: response.data.id || '',
        source: 'google-calendar' as EventSource,
        createdAt: new Date(),
        updatedAt: new Date()
      } as CalendarEvent;

      return {
        success: true,
        data: createdEvent,
        status: 200
      };

    } catch (error) {
      console.error('Google Calendar create event error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Google Calendar event',
        status: 500
      };
    }
  }

  /**
   * Get Calendly events
   */
  async getCalendlyEvents(
    userUri?: string,
    count: number = 100
  ): Promise<CalendarApiResponse<CalendarEvent[]>> {
    try {
      const targetUri = userUri || this.calendlyConfig.userUri;
      if (!targetUri) {
        throw new Error('Calendly user URI is required');
      }

      const response = await fetch(
        `https://api.calendly.com/scheduled_events?user=${targetUri}&count=${count}`,
        {
          headers: {
            'Authorization': `Bearer ${this.calendlyConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Calendly API error: ${response.status}`);
      }

      const data = await response.json();
      const events = (data.collection || []).map((event: any) => ({
        id: event.uri.split('/').pop() || '',
        title: event.name || event.event_type?.name || 'Untitled Event',
        description: event.event_type?.description || '',
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        allDay: false,
        location: event.location?.location || '',
        attendees: [],
        type: 'appointment' as EventType,
        status: event.status as EventStatus,
        source: 'calendly' as EventSource,
        externalId: event.uri,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at)
      }));

      return {
        success: true,
        data: events,
        status: 200
      };

    } catch (error) {
      console.error('Calendly API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Calendly events',
        status: 500
      };
    }
  }

  /**
   * Get Calendly event types
   */
  async getCalendlyEventTypes(userUri?: string): Promise<CalendarApiResponse<any[]>> {
    try {
      const targetUri = userUri || this.calendlyConfig.userUri;
      if (!targetUri) {
        throw new Error('Calendly user URI is required');
      }

      const response = await fetch(
        `https://api.calendly.com/event_types?user=${targetUri}`,
        {
          headers: {
            'Authorization': `Bearer ${this.calendlyConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Calendly API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.collection || [],
        status: 200
      };

    } catch (error) {
      console.error('Calendly event types error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Calendly event types',
        status: 500
      };
    }
  }

  /**
   * Validate Google Calendar credentials
   */
  async validateGoogleCredentials(): Promise<boolean> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.googleOAuth2Client });
      await calendar.calendarList.list({ maxResults: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate Calendly API key
   */
  async validateCalendlyCredentials(): Promise<boolean> {
    try {
      const response = await fetch('https://api.calendly.com/user', {
        headers: {
          'Authorization': `Bearer ${this.calendlyConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh Google access token
   */
  async refreshGoogleToken(): Promise<any> {
    try {
      const { credentials } = await this.googleOAuth2Client.refreshAccessToken();
      this.googleOAuth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      throw new Error('Failed to refresh Google access token');
    }
  }
}

// Default configuration
export const defaultCalendarConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  },
  calendly: {
    apiKey: process.env.CALENDLY_API_KEY || '',
  }
}; 