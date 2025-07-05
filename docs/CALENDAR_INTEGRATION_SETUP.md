# Calendar Integration Setup Guide

This guide will help you set up Google Calendar and Calendly integrations for the ACS Calendar system.

## Overview

The calendar system now supports direct integration with:
- **Google Calendar**: Full OAuth integration with event creation, reading, and management
- **Calendly**: API integration for reading scheduled events and event types

## Google Calendar Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Configure OAuth 2.0

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Note down your Client ID and Client Secret

### 3. Environment Variables

Add these to your `.env.local` file:

```env
# Google Calendar
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Calendly Setup

### 1. Get API Key

1. Log in to your [Calendly account](https://calendly.com/)
2. Go to "Integrations" > "API & Webhooks"
3. Click "Generate New API Key"
4. Copy the API key

### 2. Get User URI

1. In the same API section, find your User URI
2. It will look like: `https://api.calendly.com/users/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

### 3. Environment Variables

Add to your `.env.local` file:

```env
# Calendly
CALENDLY_API_KEY=your_api_key_here
CALENDLY_USER_URI=https://api.calendly.com/users/your-user-uri
```

## Usage

### Connecting Integrations

1. Navigate to the Calendar page in your dashboard
2. Click on the "Integrations" tab
3. Click "Connect" for Google Calendar or Calendly
4. Follow the OAuth flow for Google Calendar
5. Enter your API key for Calendly

### Features Available

#### Google Calendar
- ✅ Read all calendar events
- ✅ Create new events
- ✅ Update existing events
- ✅ Delete events
- ✅ Real-time sync
- ✅ Multiple calendar support

#### Calendly
- ✅ Read scheduled events
- ✅ View event types
- ✅ Event details and attendee information
- ✅ Real-time sync

### Data Flow

The system follows a centralized data flow pattern:

1. **Raw Data**: Events from Google Calendar and Calendly APIs
2. **Processing**: Centralized processing in `lib/utils/calendar.ts`
3. **Normalization**: All events converted to consistent `CalendarEvent` format
4. **Components**: UI components receive processed, normalized data

### Calendar Views

The calendar supports multiple views:
- **Month View**: Traditional calendar grid
- **Week View**: Weekly schedule view
- **Day View**: Daily detailed view
- **Agenda View**: List view of upcoming events

### AI Scheduling Features

The AI scheduling panel includes:
- **Preferences**: Set preferred duration, buffer times, max events per day
- **Suggestions**: AI-powered scheduling recommendations
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Optimization**: Suggestions for better time management

### Analytics

The analytics panel provides:
- **Event Distribution**: Breakdown by source (Google Calendar, Calendly, etc.)
- **Event Types**: Analysis of different event categories
- **Performance Metrics**: Completion rates, average duration, utilization
- **Weekly Trends**: Day-by-day event distribution
- **AI Insights**: Intelligent recommendations for schedule optimization

## Troubleshooting

### Google Calendar Issues

**Error: "Invalid redirect URI"**
- Ensure the redirect URI in your Google Cloud Console matches exactly
- Check that the environment variable `GOOGLE_REDIRECT_URI` is set correctly

**Error: "Access denied"**
- Make sure you've enabled the Google Calendar API
- Check that your OAuth consent screen is configured properly

### Calendly Issues

**Error: "Invalid API key"**
- Verify your API key is correct
- Ensure the API key has the necessary permissions

**Error: "User URI not found"**
- Check that your Calendly User URI is correct
- Make sure you're using the full URI from the Calendly API settings

### General Issues

**Events not syncing**
- Check the browser console for errors
- Verify all environment variables are set
- Try refreshing the calendar data manually

**Performance issues**
- The system auto-refreshes every 5 minutes
- You can adjust the refresh interval in the `useCalendarData` hook
- Large numbers of events may take longer to process

## Security Considerations

1. **Environment Variables**: Never commit API keys or secrets to version control
2. **OAuth Tokens**: Google OAuth tokens are stored securely and refreshed automatically
3. **API Limits**: Be aware of Google Calendar and Calendly API rate limits
4. **Data Privacy**: Only calendar data you explicitly authorize is accessed

## Advanced Configuration

### Custom Event Processing

You can customize how events are processed by modifying the processing functions in `lib/utils/calendar.ts`:

```typescript
// Custom processing for Google Calendar events
export function processGoogleCalendarEvents(rawEvents: GoogleCalendarEvent[]): CalendarEvent[] {
  // Your custom logic here
}

// Custom processing for Calendly events
export function processCalendlyEvents(rawEvents: CalendlyEvent[]): CalendarEvent[] {
  // Your custom logic here
}
```

### Custom Filters

Add custom filters by extending the `CalendarFilters` interface:

```typescript
export interface CalendarFilters {
  // Existing filters...
  customFilter?: string;
}
```

### Custom Analytics

Extend the analytics by adding new metrics to the `CalendarAnalytics` component:

```typescript
function CalendarAnalytics({ events, stats }) {
  // Add your custom analytics here
  const customMetric = calculateCustomMetric(events);
  
  return (
    // Your custom analytics UI
  );
}
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test the integrations individually
4. Review the API documentation for Google Calendar and Calendly

## Changelog

### v1.0.0
- Initial release with Google Calendar and Calendly integration
- Centralized data processing system
- AI scheduling features
- Comprehensive analytics
- Multi-view calendar interface 