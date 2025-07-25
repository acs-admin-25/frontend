import React, { useState, useEffect } from 'react';
import { useCalendarData } from '@/lib/hooks/useCalendarData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { toZonedTime, format } from 'date-fns-tz';
import { saveCalendarEvent, fetchCalendarEvents, deleteCalendarEvent } from '@/lib/firebaseEvents';

interface CalendarIntegrationProps {
  className?: string;
  setClientOutlookEvents?: (events: any[]) => void;
}

export function CalendarIntegration(props: CalendarIntegrationProps) {
  const { className, setClientOutlookEvents } = props;
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string>('');
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingCalendly, setIsConnectingCalendly] = useState(false);
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false);
  const [outlookEvents, setOutlookEvents] = useState<any[]>([]);
  const [outlookConnectionStatus, setOutlookConnectionStatus] = useState<{
    isConnected: boolean;
    integration: any;
  }>({ isConnected: false, integration: null });
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  const {
    events,
    googleEvents,
    calendlyEvents,
    loading,
    error,
    stats,
    refetch,
    refreshGoogleEvents,
    refreshCalendlyEvents,
    createEvent
  } = useCalendarData({
    autoRefresh: false,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    enableGoogle: true,
    enableCalendly: true
  });

  // Load Outlook connection status and events
  useEffect(() => {
    loadOutlookStatus();
    
    // Also check if we have an access token in sessionStorage
    const accessToken = sessionStorage.getItem('outlookAccessToken');
    if (accessToken) {
      setOutlookConnectionStatus(prev => ({
        ...prev,
        isConnected: true
      }));
    }
    
    // Set up periodic check for connection status
    const checkConnectionStatus = () => {
      const token = sessionStorage.getItem('outlookAccessToken');
      if (token) {
        setOutlookConnectionStatus(prev => ({
          ...prev,
          isConnected: true
        }));
      }
    };
    
    // Check immediately and then every 2 seconds for the first 10 seconds
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 2000);
    
    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(interval), 10000);
    
    return () => clearInterval(interval);
  }, []);

  // After OAuth callback, store access token in sessionStorage and auto-fetch events
  useEffect(() => {
    // Check for access token in URL or window object (if you pass it from callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('outlook_access_token');
    if (token) {
      sessionStorage.setItem('outlookAccessToken', token);
      // Clean up the URL
      params.delete('outlook_access_token');
      const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
      window.history.replaceState({}, '', newUrl);
      
      // Immediately update connection status
      setOutlookConnectionStatus(prev => ({
        ...prev,
        isConnected: true
      }));
      
      // Automatically fetch Outlook events after successful connection
      setTimeout(() => {
        fetchAndDisplayOutlookEvents(false); // Don't show alerts for auto-fetch
      }, 1000); // Small delay to ensure token is stored
    }
  }, []);

  const loadOutlookStatus = async () => {
    try {
      const response = await fetch('/api/calendar/outlook/connection');
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error('Outlook status API error:', response.status, response.statusText);
        return;
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Outlook status API returned non-JSON response:', contentType);
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        setOutlookConnectionStatus({
          isConnected: result.data.isConnected,
          integration: result.data.integration
        });
      }
    } catch (error) {
      console.error('Failed to load Outlook status:', error);
    }
  };

  const loadOutlookEvents = async () => {
    try {
      const response = await fetch('/api/calendar/outlook?events=true');
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error('Outlook events API error:', response.status, response.statusText);
        return;
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Outlook events API returned non-JSON response:', contentType);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data.events) {
        setOutlookEvents(result.data.events);
      }
    } catch (error) {
      console.error('Failed to load Outlook events:', error);
    }
  };

  const refreshOutlookEvents = async () => {
    try {
      const response = await fetch('/api/calendar/outlook/sync', {
        method: 'POST'
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error('Outlook sync API error:', response.status, response.statusText);
        return;
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Outlook sync API returned non-JSON response:', contentType);
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Outlook events synced:', result.data);
        await loadOutlookEvents();
        await loadOutlookStatus();
      } else {
        console.error('Failed to sync Outlook events:', result.error);
      }
    } catch (error) {
      console.error('Failed to refresh Outlook events:', error);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      // Get Google OAuth URL from API
      const response = await fetch('/api/calendar/google/auth-url');
      const result = await response.json();
      
      if (result.success && result.data?.authUrl) {
        setGoogleAuthUrl(result.data.authUrl);
        // In a real app, you'd redirect to this URL or open it in a popup
        window.open(result.data.authUrl, '_blank');
      } else {
        throw new Error('Failed to get Google auth URL');
      }
    } catch (error) {
      console.error('Failed to generate Google auth URL:', error);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleConnectCalendly = async () => {
    setIsConnectingCalendly(true);
    try {
      // For Calendly, you typically need to get the user's URI first
      // This is a simplified example
      const response = await fetch('/api/calendar/calendly/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'your-calendly-api-key' // This should come from user input
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('Calendly connected successfully');
          // Refresh events
          await refreshCalendlyEvents();
        }
      }
    } catch (error) {
      console.error('Failed to connect Calendly:', error);
    } finally {
      setIsConnectingCalendly(false);
    }
  };

  const handleConnectOutlook = async () => {
    setIsConnectingOutlook(true);
    try {
      // Get Outlook OAuth URL from API
      const response = await fetch('/api/calendar/outlook/auth-url');
      const result = await response.json();
      
      if (result.success && result.data?.authUrl) {
        // Redirect to Outlook OAuth
        window.location.href = result.data.authUrl;
      } else {
        throw new Error('Failed to get Outlook auth URL');
      }
    } catch (error) {
      console.error('Failed to generate Outlook auth URL:', error);
    } finally {
      setIsConnectingOutlook(false);
    }
  };

  const handleCreateEvent = async () => {
    const newEvent: any = {
      title: 'Test Event',
      description: 'This is a test event created from the calendar integration',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
      allDay: false,
      location: 'Test Location',
      attendees: ['test@example.com'],
      type: 'meeting',
      status: 'scheduled',
      source: 'google-calendar'
    };

    const createdEvent = await createEvent(newEvent);
    if (createdEvent) {
      console.log('Event created:', createdEvent);
    }
  };

  // Helper to fetch events from Microsoft Graph API
  async function fetchOutlookEventsClient(accessToken: string) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 60); // Increased to 60 days back
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 120); // Increased to 120 days forward
    
    console.log('Fetching Outlook events from:', startTime.toISOString(), 'to:', endTime.toISOString());
    
    // Add parameters to force fresh data and increase limit
    const timestamp = new Date().getTime();
    const url = `https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge '${startTime.toISOString()}' and end/dateTime le '${endTime.toISOString()}'&$top=100&$orderby=start/dateTime&_t=${timestamp}`;
    console.log('🔍 Making request to Microsoft Graph API...');
    console.log('🔍 URL:', url);
    console.log('🔍 Access token exists:', !!accessToken);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Error response:', errorText);
      throw new Error(`Failed to fetch Outlook events: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    console.log('Raw Microsoft Graph response:', data);
    console.log('Total events in response:', data.value?.length || 0);
    
    return (data.value || []).map((event: any) => {
      console.log('Raw Outlook event:', event.start?.dateTime, event.end?.dateTime, 'Subject:', event.subject);
      return {
        id: event.id,
        title: event.subject || 'Untitled Event',
        description: event.body?.content || '',
        startTime: event.start?.dateTime ? cleanOutlookDateString(event.start.dateTime) : null,
        endTime: event.end?.dateTime ? cleanOutlookDateString(event.end.dateTime) : null,
        allDay: event.isAllDay || false,
        location: event.location?.displayName || '',
        attendees: event.attendees?.map((a: any) => a.emailAddress?.address).filter(Boolean) || [],
        type: 'meeting',
        status: 'scheduled',
        source: 'outlook-calendar',
        externalId: event.id, // Add this for duplicate prevention
        user_email: 'nayananona@gmail.com', // Add this for duplicate prevention
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
  }

  function cleanOutlookDateString(dateString: string) {
    return dateString.replace(/\.\d+$/, '');
  }

  const fetchAndDisplayOutlookEvents = async (showAlert = true) => {
    console.log('🚀 STARTING OUTLOOK FETCH - IMPROVED VERSION');
    const accessToken = sessionStorage.getItem('outlookAccessToken');
    if (!accessToken) {
      if (showAlert) {
        alert('No Outlook access token found. Please connect Outlook first.');
      }
      return;
    }
    
    setIsAutoFetching(true);
    try {
      // Fetch fresh events from Outlook
      const outlookEvents = await fetchOutlookEventsClient(accessToken);
      console.log('📅 Fetched events from Outlook:', outlookEvents.length);
      
      // Get existing events from Firestore
      const existingEvents = await fetchCalendarEvents();
      const existingOutlookEvents = existingEvents.filter((e: any) => e.source === 'outlook-calendar');
      console.log('🗄️ Existing Outlook events in Firestore:', existingOutlookEvents.length);
      
      let newEventsCount = 0;
      let deletedEventsCount = 0;
      
      // Create maps for efficient lookup
      const outlookEventMap = new Map();
      const existingEventMap = new Map();
      
      // Map Outlook events by externalId for quick lookup
      outlookEvents.forEach((event: any) => {
        if (event.externalId) {
          outlookEventMap.set(event.externalId, event);
        }
      });
      
      // Map existing events by externalId for quick lookup
      existingOutlookEvents.forEach((event: any) => {
        if (event.externalId) {
          existingEventMap.set(event.externalId, event);
        }
      });
      
      // Find events to delete (exist in Firestore but not in Outlook)
      const eventsToDelete = existingOutlookEvents.filter((event: any) => {
        return event.externalId && !outlookEventMap.has(event.externalId);
      });
      
      console.log('🗑️ Events to delete (removed from Outlook):', eventsToDelete.length);
      eventsToDelete.forEach((event: any) => {
        console.log('  - Deleting:', event.title, '(externalId:', event.externalId, ')');
      });
      
      // Delete events that were removed from Outlook
      for (const event of eventsToDelete) {
        await deleteCalendarEvent(event.id);
        deletedEventsCount++;
      }
      
      // Find events to add (exist in Outlook but not in Firestore)
      const eventsToAdd = outlookEvents.filter((event: any) => {
        return event.externalId && !existingEventMap.has(event.externalId);
      });
      
      console.log('➕ Events to add (new in Outlook):', eventsToAdd.length);
      eventsToAdd.forEach((event: any) => {
        console.log('  - Adding:', event.title, '(externalId:', event.externalId, ')');
      });
      
      // Add new events from Outlook
      for (const event of eventsToAdd) {
        await saveCalendarEvent(event);
        newEventsCount++;
      }
      
      // Update client events if callback provided
      if (setClientOutlookEvents) {
        setClientOutlookEvents(outlookEvents);
      }
      
      // Show results
      if (showAlert) {
        const message = `Sync completed!\n\n📊 Results:\n• Fetched ${outlookEvents.length} events from Outlook\n• Added ${newEventsCount} new events\n• Deleted ${deletedEventsCount} removed events\n\nYour calendar is now in sync with Outlook!`;
        alert(message);
        
        // Force a page refresh to update the calendar display
        console.log('🔄 Refreshing page to update calendar display...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log(`Auto-sync completed: ${newEventsCount} added, ${deletedEventsCount} deleted`);
      }
      
      // Update connection status
      setOutlookConnectionStatus(prev => ({
        ...prev,
        isConnected: true
      }));
      
      // Add manual cleanup function to window for debugging
      (window as any).cleanupAllEvents = async () => {
        console.log('🧹 MANUAL CLEANUP: Clearing all events...');
        try {
          const allEvents = await fetchCalendarEvents();
          console.log('🧹 Found', allEvents.length, 'total events to delete');
          
          for (const event of allEvents) {
            console.log('🗑️ Deleting:', (event as any).title, (event as any).source);
            await deleteCalendarEvent(event.id);
          }
          
          console.log('🧹 MANUAL CLEANUP: All events deleted!');
          alert('All events have been cleared from the calendar!');
        } catch (error) {
          console.error('🧹 MANUAL CLEANUP failed:', error);
        }
      };
      
    } catch (err) {
      if (showAlert) {
        alert('Failed to sync Outlook events: ' + err);
      } else {
        console.error('Auto-sync failed:', err);
      }
    } finally {
      setIsAutoFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading calendar data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">Calendar Error</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <Button 
          onClick={refetch} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Google Calendar</h4>
                <p className="text-sm text-gray-600">
                  {googleEvents.length > 0 
                    ? `Connected (${googleEvents.length} events)` 
                    : 'Not connected'
                  }
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  onClick={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  variant="outline"
                  size="sm"
                >
                  {isConnectingGoogle ? 'Connecting...' : 'Connect'}
                </Button>
                {googleEvents.length > 0 && (
                  <Button
                    onClick={refreshGoogleEvents}
                    variant="outline"
                    size="sm"
                  >
                    Refresh
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Calendly</h4>
                <p className="text-sm text-gray-600">
                  {calendlyEvents.length > 0 
                    ? `Connected (${calendlyEvents.length} events)` 
                    : 'Not connected'
                  }
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  onClick={handleConnectCalendly}
                  disabled={isConnectingCalendly}
                  variant="outline"
                  size="sm"
                >
                  {isConnectingCalendly ? 'Connecting...' : 'Connect'}
                </Button>
                {calendlyEvents.length > 0 && (
                  <Button
                    onClick={refreshCalendlyEvents}
                    variant="outline"
                    size="sm"
                  >
                    Refresh
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Outlook Calendar</h4>
                <p className="text-sm text-gray-600">
                  {isAutoFetching 
                    ? 'Syncing events...' 
                    : outlookConnectionStatus.isConnected 
                    ? 'Connected' 
                    : 'Not connected'
                  }
                </p>
              </div>
              <div className="space-x-2">
                {outlookConnectionStatus.isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    Connected
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnectOutlook}
                    disabled={isConnectingOutlook}
                    variant="outline"
                    size="sm"
                  >
                    {isConnectingOutlook ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.past}</div>
                <div className="text-sm text-gray-600">Past</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.sourceBreakdown).length}
                </div>
                <div className="text-sm text-gray-600">Sources</div>
              </div>
            </div>

            {stats.nextEvent && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">Next Event</h4>
                <p className="text-blue-600">{stats.nextEvent.title}</p>
                <p className="text-sm text-blue-500">
                  {stats.nextEvent.startTime.toLocaleDateString()} at{' '}
                  {stats.nextEvent.startTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 && outlookEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No events found</p>
            ) : (
              <div className="space-y-3">
                {[...events, ...outlookEvents].slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.startTime ? format(toZonedTime(event.startTime, 'America/Los_Angeles'), 'hh:mm aaaa', { timeZone: 'America/Los_Angeles' }) : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Source: {event.source}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.source === 'google-calendar' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleCreateEvent} variant="outline" size="sm">
              Create Test Event
            </Button>
            <Button onClick={refetch} variant="outline" size="sm">
              Refresh All Data
            </Button>
            <Button onClick={() => fetchAndDisplayOutlookEvents(true)} variant="outline" size="sm">
              Fetch Outlook Events (Client)
            </Button>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
} 