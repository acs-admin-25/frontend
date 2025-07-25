"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Calendar, 
  Filter, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  Bell,
  Settings,
  ExternalLink,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  CalendarDays,
  Zap,
  Target,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { LoadingSpinner } from "@/components/common/Feedback/LoadingSpinner"
import { ErrorBoundary } from "@/components/common/Feedback/ErrorBoundary"

import { useCalendarData } from "@/lib/hooks/useCalendarData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { 
  AvailabilitySlot, 
  EventType, 
  EventStatus,
  CalendarIntegration as CalendarIntegrationType,
  AISchedulingPreferences,
  CalendarFilters,
  CalendarEvent,
  EventSource
} from "@/lib/types/calendar"
import { CalendarIntegration } from "../CalendarIntegration"
import { parse } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';
import { onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// If you see a module error for 'date-fns-tz', run: npm install date-fns-tz

// Utility functions for date handling (top-level scope)
function parseEventString(dateString: string) {
  return parse(dateString.replace(/\.\d+$/, ''), "yyyy-MM-dd'T'HH:mm:ss", new Date());
}

function formatEventTimeToPST(dateString: string) {
  if (!dateString) {
    return '';
  }
  const clean = dateString.replace(/\.\d+$/, '');
  const utcDate = new Date(clean + 'Z'); // 👈 force UTC
  if (isNaN(utcDate.getTime())) {
    return '';
  }
  let zoned;
  try {
    zoned = toZonedTime(utcDate, 'America/Los_Angeles');
  } catch (error) {
    return '';
  }
  try {
    const result = format(zoned, 'hh:mm aaaa', { timeZone: 'America/Los_Angeles' });
    return result;
  } catch (error) {
    return '';
  }
}

function formatEventDateToPST(dateInput: string | Date) {
  let parsed: Date;
  if (!dateInput) {
    return '';
  }
  if (typeof dateInput === 'string') {
    parsed = parseEventString(dateInput);
  } else {
    parsed = dateInput;
  }
  if (isNaN(parsed.getTime())) {
    return '';
  }
  const result = parsed.toLocaleDateString('en-CA'); // yyyy-mm-dd
  return result;
}

function isSameDayInPST(eventStart: string | Date, gridDate: Date) {
  let eventDate: Date;
  if (typeof eventStart === 'string') {
    // Convert to PST properly
    const clean = eventStart.replace(/\.\d+$/, '');
    const utcDate = new Date(clean + 'Z'); // Force UTC
    eventDate = toZonedTime(utcDate, 'America/Los_Angeles');
  } else {
    eventDate = eventStart;
  }
  
  return (
    eventDate.getFullYear() === gridDate.getFullYear() &&
    eventDate.getMonth() === gridDate.getMonth() &&
    eventDate.getDate() === gridDate.getDate()
  );
}



export default function CalendarContent() {
  // Ensure this is the very first line in the component
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  // Store Outlook access token from URL in sessionStorage (for client-side fetch)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('outlook_access_token');
    if (token) {
      sessionStorage.setItem('outlookAccessToken', token);
      // Clean up the URL
      params.delete('outlook_access_token');
      const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [showEventModal, setShowEventModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [activeTab, setActiveTab] = useState('calendar')
  const [filters, setFilters] = useState<CalendarFilters>({})
  const [clientOutlookEvents, setClientOutlookEvents] = useState<CalendarEvent[]>([]);

  // Use the centralized calendar data hook
  const {
    events: calendarEventsFromHook,
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
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    enableGoogle: true,
    enableCalendly: true,
    filters
  })

  // For now, use only Outlook events for display
  const eventsToDisplay: CalendarEvent[] = events;

  // Filter events based on search term
  const filteredEvents = eventsToDisplay.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get current month events for calendar grid
  const getCurrentMonthEvents = () => {
    // Show all events, but we'll style them differently based on month
    return eventsToDisplay
  }

  const currentMonthEvents = getCurrentMonthEvents()

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return eventsToDisplay.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= now && eventDate <= nextWeek
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const upcomingEvents = getUpcomingEvents()

  // Get today's events
  const getTodayEvents = () => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    return eventsToDisplay.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= todayStart && eventDate < todayEnd
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const todayEvents = getTodayEvents()

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const goToPreviousMonth = () => {
    setCurrentViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setCurrentViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentViewDate(new Date())
  }

  // Force refresh events from Firestore
  const forceRefreshEvents = async () => {
    console.log('🔄 Force refreshing events...');
    try {
      // Clear events state immediately
      console.log('🗑️ Clearing current events state...');
      setEvents([]);
      
      // Wait a moment for the clear to take effect
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { fetchCalendarEvents } = await import('@/lib/firebaseEvents');
      const freshEvents = await fetchCalendarEvents();
      console.log('📅 Force refreshed events:', freshEvents.length);
      console.log('📅 Fresh events details:', freshEvents.map((e: any) => ({ id: e.id, title: e.title, source: e.source })));
      
      // Set new events with multiple re-renders to ensure UI updates
      setEvents(freshEvents.map((doc: any) => ({
        id: doc.id,
        title: typeof doc.title === 'string' ? doc.title : 'Untitled Event',
        description: typeof doc.description === 'string' ? doc.description : '',
        startTime: typeof doc.startTime === 'string' ? doc.startTime : new Date().toISOString(),
        endTime: typeof doc.endTime === 'string' ? doc.endTime : new Date().toISOString(),
        allDay: typeof doc.allDay === 'boolean' ? doc.allDay : false,
        location: typeof doc.location === 'string' ? doc.location : '',
        attendees: Array.isArray(doc.attendees) ? doc.attendees : [],
        type: (['property-viewing','consultation','offer-presentation','contract-signing','follow-up','meeting','appointment','custom'].includes(doc.type)) ? doc.type as EventType : 'meeting',
        status: (['scheduled','confirmed','pending','cancelled','completed','no-show'].includes(doc.status)) ? doc.status as EventStatus : 'scheduled',
        source: (['manual','calendly','google-calendar','ai-scheduled','imported'].includes(doc.source)) ? doc.source as EventSource : 'imported',
        externalId: typeof doc.externalId === 'string' ? doc.externalId : undefined,
        recurrence: doc.recurrence || undefined,
        color: typeof doc.color === 'string' ? doc.color : undefined,
        notes: typeof doc.notes === 'string' ? doc.notes : undefined,
        clientId: typeof doc.clientId === 'string' ? doc.clientId : undefined,
        leadId: typeof doc.leadId === 'string' ? doc.leadId : undefined,
        timeZone: typeof doc.timeZone === 'string' ? doc.timeZone : undefined,
        sourceId: typeof doc.sourceId === 'string' ? doc.sourceId : undefined,
        sourceUrl: typeof doc.sourceUrl === 'string' ? doc.sourceUrl : undefined,
        isAllDay: typeof doc.isAllDay === 'boolean' ? doc.isAllDay : undefined,
        metadata: typeof doc.metadata === 'object' ? doc.metadata : undefined,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
      })));
      
      console.log('📅 Events state updated with fresh data');
      
      // Force additional re-renders to ensure UI updates
      setTimeout(() => {
        console.log('🔄 Forcing additional re-render...');
        setEvents(prevEvents => [...prevEvents]);
      }, 300);
      
      setTimeout(() => {
        console.log('🔄 Forcing final re-render...');
        setEvents(prevEvents => [...prevEvents]);
      }, 600);
      
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
    }
  };

  // Simple page refresh as backup
  const refreshPage = () => {
    console.log('🔄 Refreshing page...');
    window.location.reload();
  };

  // Event modal handlers
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    console.log('📝 Editing event:', event);
    console.log('📝 Event ID:', event.id);
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    console.log('✅ Event saved callback triggered:', event);
    console.log('✅ Event ID:', event.id);
    console.log('✅ Event title:', event.title);
    setShowEventModal(false);
    setSelectedEvent(null);
    
    // Force a refresh to ensure the UI updates
    setTimeout(() => {
      console.log('🔄 Forcing event refresh...');
      forceRefreshEvents();
    }, 500);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      console.log('🗑️ Attempting to delete event:', event);
      console.log('🗑️ Event ID:', event.id);
      console.log('🗑️ Event externalId:', event.externalId);
      
      if (!event.id) {
        throw new Error('Event ID is missing. Cannot delete event without an ID.');
      }
      
      // Delete from local calendar (Firestore) first
      const { deleteCalendarEvent } = await import('@/lib/firebaseEvents');
      await deleteCalendarEvent(event.id);
      console.log('🗑️ Event deleted from local calendar:', event.title);
      
      // Delete from Outlook if connected
      const accessToken = sessionStorage.getItem('outlookAccessToken');
      if (accessToken) {
        let outlookEventId = event.externalId;
        
        // If no externalId, try to find the event in Outlook
        if (!outlookEventId) {
          console.log('🔍 No externalId found, searching for event in Outlook...');
          const foundId = await findOutlookEventId(event.title, typeof event.startTime === 'string' ? event.startTime : event.startTime.toISOString(), accessToken);
          outlookEventId = foundId || undefined;
        }
        
        if (outlookEventId && outlookEventId !== null) {
          try {
            console.log('🗑️ Deleting from Outlook with ID:', outlookEventId);
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${outlookEventId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              console.log('✅ Event deleted from Outlook successfully');
            } else if (response.status === 404) {
              console.log('ℹ️ Event not found in Outlook (already deleted or never existed)');
            } else {
              console.warn('⚠️ Failed to delete event from Outlook:', response.status, response.statusText);
            }
          } catch (error) {
            console.warn('⚠️ Error deleting from Outlook:', error);
          }
        } else {
          console.log('ℹ️ Could not find matching event in Outlook');
        }
      } else {
        console.log('ℹ️ No Outlook connection, skipping Outlook deletion');
      }
      
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      alert('Failed to delete event: ' + (error instanceof Error ? error.message : error));
    }
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Helper function to find Outlook event by title and time
  const findOutlookEventId = async (title: string, startTime: string, accessToken: string): Promise<string | null> => {
    try {
      console.log('🔍 Searching for Outlook event:', title, startTime);
      
      // Search for events in the last 30 days and next 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}&$top=100`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const events = data.value || [];
        
        // Find matching event by title and start time
        const matchingEvent = events.find((event: any) => {
          const eventStart = new Date(event.start.dateTime);
          const targetStart = new Date(startTime);
          const timeDiff = Math.abs(eventStart.getTime() - targetStart.getTime());
          
          return event.subject === title && timeDiff < 60000; // Within 1 minute
        });
        
        if (matchingEvent) {
          console.log('✅ Found matching Outlook event:', matchingEvent.id);
          return matchingEvent.id;
        } else {
          console.log('❌ No matching Outlook event found');
          return null;
        }
      } else {
        console.warn('⚠️ Failed to search Outlook events:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Error searching Outlook events:', error);
      return null;
    }
  };





  // Firestore real-time subscription for calendar events
  useEffect(() => {
    console.log('🔄 Setting up Firestore listener...');
    const q = query(collection(db, 'calendarEvents'));
    
    // Track previous event count for deletion detection
    let previousEventCount = 0;
    let isFirstLoad = true;
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const currentEventCount = querySnapshot.docs.length;
      console.log('📅 Firestore update received:', currentEventCount, 'events');
      
      if (!isFirstLoad) {
        console.log('📅 Previous event count:', previousEventCount);
        
        // Check if this might be a deletion
        if (currentEventCount < previousEventCount) {
          console.log('🗑️ DELETION DETECTED: Event count decreased from', previousEventCount, 'to', currentEventCount);
        }
      } else {
        console.log('📅 First load - setting initial count');
        isFirstLoad = false;
      }
      
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const event = {
          id: doc.id,
          title: typeof data.title === 'string' ? data.title : 'Untitled Event',
          description: typeof data.description === 'string' ? data.description : '',
          startTime: typeof data.startTime === 'string' ? data.startTime : new Date().toISOString(),
          endTime: typeof data.endTime === 'string' ? data.endTime : new Date().toISOString(),
          allDay: typeof data.allDay === 'boolean' ? data.allDay : false,
          location: typeof data.location === 'string' ? data.location : '',
          attendees: Array.isArray(data.attendees) ? data.attendees : [],
          type: (['property-viewing','consultation','offer-presentation','contract-signing','follow-up','meeting','appointment','custom'].includes(data.type)) ? data.type as EventType : 'meeting',
          status: (['scheduled','confirmed','pending','cancelled','completed','no-show'].includes(data.status)) ? data.status as EventStatus : 'scheduled',
          source: (['manual','calendly','google-calendar','ai-scheduled','imported'].includes(data.source)) ? data.source as EventSource : 'imported',
          externalId: typeof data.externalId === 'string' ? data.externalId : undefined,
          recurrence: data.recurrence || undefined,
          color: typeof data.color === 'string' ? data.color : undefined,
          notes: typeof data.notes === 'string' ? data.notes : undefined,
          clientId: typeof data.clientId === 'string' ? data.clientId : undefined,
          leadId: typeof data.leadId === 'string' ? data.leadId : undefined,
          timeZone: typeof data.timeZone === 'string' ? data.timeZone : undefined,
          sourceId: typeof data.sourceId === 'string' ? data.sourceId : undefined,
          sourceUrl: typeof data.sourceUrl === 'string' ? data.sourceUrl : undefined,
          isAllDay: typeof data.isAllDay === 'boolean' ? data.isAllDay : undefined,
          metadata: typeof data.metadata === 'object' ? data.metadata : undefined,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };
        
        console.log('📅 Mapped event:', { id: event.id, title: event.title, startTime: event.startTime });
        return event;
      });
      
      console.log('📅 Setting events state with:', events.length, 'events');
      console.log('📅 Event titles:', events.map(e => e.title));
      
      // Force a state update to ensure UI re-renders
      setEvents([...events]); // Use spread operator to ensure new array reference
      
      // If deletion was detected, force additional re-renders
      if (!isFirstLoad && currentEventCount < previousEventCount) {
        console.log('🔄 Forcing UI update after deletion...');
        setTimeout(() => {
          console.log('🔄 Forcing second re-render after deletion...');
          setEvents(prevEvents => [...prevEvents]); // Force another re-render
        }, 100);
        
        setTimeout(() => {
          console.log('🔄 Forcing third re-render after deletion...');
          setEvents(prevEvents => [...prevEvents]); // Force another re-render
        }, 500);
      }
      
      // Update previous count for next comparison
      previousEventCount = currentEventCount;
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });
    
    console.log('✅ Firestore listener set up successfully');
    return () => {
      console.log('🔄 Cleaning up Firestore listener...');
      unsubscribe();
    };
  }, []); // or [activeTab] if you want to re-subscribe on tab change



  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading calendar..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Calendar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[#0e6537] text-white rounded-lg hover:bg-[#157a42] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar & Scheduling</h1>
              <p className="text-gray-600">Manage events, integrations, and AI-powered scheduling</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={forceRefreshEvents}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Events
              </Button>
              <Button
                onClick={refreshPage}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>


              <Button
                onClick={() => setShowIntegrationModal(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Integrations
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Events</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Upcoming</p>
                    <p className="text-2xl font-bold text-green-800">{stats.upcoming}</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Sources</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {Object.keys(stats.sourceBreakdown).length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Today</p>
                    <p className="text-2xl font-bold text-orange-800">{todayEvents.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="ai-scheduling" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI Scheduling
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="calendar" className="h-full p-6 overflow-auto">
              <div className="space-y-6">
                {/* Search and Controls */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search events..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e6537] focus:border-transparent"
                        />
                      </div>

                      {/* Date Picker */}
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e6537] focus:border-transparent"
                        />
                      </div>

                      {/* View Toggle */}
                      <div className="flex items-center gap-2">
                        {(['month', 'week', 'day', 'agenda'] as const).map((viewType) => (
                          <Button
                            key={viewType}
                            onClick={() => setView(viewType)}
                            variant={view === viewType ? "default" : "outline"}
                            size="sm"
                          >
                            {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Calendar Grid and Events */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Calendar Grid */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Calendar View
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Navigation Controls */}
                          <div className="flex items-center justify-between">
                            <Button
                              onClick={goToPreviousMonth}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            
                            <div className="flex items-center gap-4">
                              <h3 className="text-lg font-semibold">
                                {currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </h3>
                            </div>
                            
                            <Button
                              onClick={goToNextMonth}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <CalendarGrid 
                            events={currentMonthEvents} 
                            onEventClick={handleEditEvent}
                            view={view}
                            currentViewDate={currentViewDate}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Today's Events */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Today's Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <UpcomingEvents 
                          events={todayEvents} 
                          onEventClick={handleEditEvent}
                          maxEvents={5}
                        />
                      </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Upcoming (7 days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <UpcomingEvents 
                          events={upcomingEvents} 
                          onEventClick={handleEditEvent}
                          maxEvents={5}
                        />
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          onClick={handleCreateEvent} 
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                        <Button 
                          onClick={() => setShowAvailabilityModal(true)} 
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Set Availability
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('ai-scheduling')} 
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          AI Scheduling
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="h-full p-6 overflow-auto">
              <CalendarIntegration setClientOutlookEvents={setClientOutlookEvents} />
            </TabsContent>

            <TabsContent value="ai-scheduling" className="h-full p-6 overflow-auto">
              <AISchedulingPanel />
            </TabsContent>

            <TabsContent value="analytics" className="h-full p-6 overflow-auto">
              <CalendarAnalytics events={eventsToDisplay} stats={stats} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseEventModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </ErrorBoundary>
  )
}

// Calendar Grid Component
function CalendarGrid({ 
  events, 
  onEventClick,
  view,
  currentViewDate
}: { 
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  view: 'month' | 'week' | 'day' | 'agenda'
  currentViewDate: Date
}) {
  const today = new Date()
  const viewMonth = currentViewDate.getMonth()
  const viewYear = currentViewDate.getFullYear()
  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push(date)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDayInPST(event.startTime, date));
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-50 p-4 text-center">
            <span className="text-sm font-medium text-gray-600">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString()
          const isCurrentMonth = date.getMonth() === viewMonth
          const dayEvents = getEventsForDate(date)

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 ${
                isToday ? "bg-[#0e6537]/10" : "bg-white"
              } ${!isCurrentMonth ? "text-gray-400" : ""}`}
            >
              {/* Date */}
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm font-medium ${
                    isToday ? "text-[#0e6537]" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-[#0e6537]"></div>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="text-xs p-1 rounded bg-[#0e6537]/10 text-[#0e6537] cursor-pointer hover:bg-[#0e6537]/20 transition-colors truncate"
                      title={`${event.title} - Click to edit`}
                    >
                      {formatEventTimeToPST(typeof event.startTime === 'string' ? event.startTime : event.startTime.toISOString())} - {event.title}
                    </div>
                  )
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Upcoming Events Component
function UpcomingEvents({ 
  events, 
  onEventClick,
  maxEvents
}: { 
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  maxEvents: number
}) {
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, maxEvents)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
      <div className="space-y-3">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => onEventClick(event)}
            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                <p className="text-sm text-gray-500">
                  {formatEventDateToPST(event.startTime)} at {formatEventTimeToPST(typeof event.startTime === 'string' ? event.startTime : event.startTime.toISOString())}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : event.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {upcomingEvents.length === 0 && (
          <p className="text-gray-500 text-center py-4">No upcoming events</p>
        )}
      </div>
    </div>
  )
}

// Placeholder Modal Components (to be implemented)
function EventModal({ event, onClose, onSave, onDelete }: any) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    startDate: event?.startTime ? new Date(event.startTime).toISOString().split('T')[0] : '',
    startTime: event?.startTime ? new Date(event.startTime).toISOString().split('T')[1].substring(0, 5) : '',
    endDate: event?.endTime ? new Date(event.endTime).toISOString().split('T')[0] : '',
    endTime: event?.endTime ? new Date(event.endTime).toISOString().split('T')[1].substring(0, 5) : '',
    allDay: event?.allDay || false
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Create event object
      const newEvent = {
        title: formData.title,
        startTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        endTime: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
        allDay: formData.allDay,
        type: 'meeting' as EventType,
        status: 'scheduled' as EventStatus,
        source: 'manual' as EventSource,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to local calendar (Firestore) first
      const { saveCalendarEvent } = await import('@/lib/firebaseEvents');
      const localEventId = await saveCalendarEvent(newEvent);

      // Save to Outlook if connected
      const accessToken = sessionStorage.getItem('outlookAccessToken');
      if (accessToken) {
        try {
          console.log('📧 Creating event in Outlook...');
          
          // Create Outlook event using Microsoft Graph API
          const outlookEvent = {
            subject: newEvent.title,
            start: {
              dateTime: newEvent.startTime,
              timeZone: 'America/Los_Angeles'
            },
            end: {
              dateTime: newEvent.endTime,
              timeZone: 'America/Los_Angeles'
            }
          };

          const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(outlookEvent)
          });

          if (response.ok) {
            const outlookResult = await response.json();
            console.log('✅ Event created in Outlook:', outlookResult.id);
            
            // Update the local event with the Outlook event ID for future deletion
            const { doc, updateDoc } = await import('firebase/firestore');
            const eventRef = doc(db, 'calendarEvents', localEventId);
            await updateDoc(eventRef, { externalId: outlookResult.id });
            console.log('✅ Updated local event with Outlook ID:', outlookResult.id);
          } else {
            const errorText = await response.text();
            console.warn('⚠️ Failed to create event in Outlook:', response.status, errorText);
          }
        } catch (error) {
          console.warn('⚠️ Error creating Outlook event:', error);
        }
      } else {
        console.log('ℹ️ No Outlook connection, event created locally only');
      }

      // Create a complete event object with the ID for the callback
      const completeEvent = {
        ...newEvent,
        id: localEventId
      };
      
      console.log('✅ Event created successfully with ID:', localEventId);
      onSave(completeEvent);
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('Failed to create event: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title"
              required
              className="w-full"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => handleInputChange('allDay', e.target.checked)}
              className="h-4 w-4 text-[#0e6537] focus:ring-[#0e6537] border-gray-300 rounded"
            />
            <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
              All day event
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(event)}
                className="flex-1"
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-[#0e6537] hover:bg-[#157a42] text-white"
            >
              {isSaving ? 'Saving...' : 'Save Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AvailabilityModal({ slot, onClose, onSave, onDelete }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {slot ? 'Edit Availability' : 'New Availability'}
        </h2>
        <p className="text-gray-600 mb-4">Availability modal implementation needed</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          {slot && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => onSave({ type: 'available' })}
            className="px-4 py-2 bg-[#0e6537] text-white rounded-lg hover:bg-[#157a42]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function IntegrationModal({ integrations, onClose, onSetupCalendly, onSetupGoogle }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Calendar Integrations</h2>
        <p className="text-gray-600 mb-4">Integration modal implementation needed</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// AI Scheduling Panel Component
function AISchedulingPanel() {
  const [preferences, setPreferences] = useState({
    preferredDuration: 60,
    bufferTime: 15,
    maxEventsPerDay: 8,
    autoConfirm: false,
    requireConfirmation: true
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Scheduling Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Duration (minutes)
              </label>
              <input
                type="number"
                value={preferences.preferredDuration}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  preferredDuration: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e6537]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Time (minutes)
              </label>
              <input
                type="number"
                value={preferences.bufferTime}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  bufferTime: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e6537]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Events Per Day
              </label>
              <input
                type="number"
                value={preferences.maxEventsPerDay}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  maxEventsPerDay: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e6537]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoConfirm"
                checked={preferences.autoConfirm}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  autoConfirm: e.target.checked 
                }))}
                className="rounded border-gray-300 text-[#0e6537] focus:ring-[#0e6537]"
              />
              <label htmlFor="autoConfirm" className="text-sm font-medium text-gray-700">
                Auto-confirm appointments
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Scheduling Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Optimize Your Schedule</h4>
              <p className="text-blue-600 text-sm mt-1">
                Based on your preferences, AI suggests scheduling meetings in 2-hour blocks with 15-minute buffers.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">Peak Performance Times</h4>
              <p className="text-green-600 text-sm mt-1">
                Your most productive hours are 9-11 AM and 2-4 PM. Consider scheduling important meetings during these times.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800">Conflict Resolution</h4>
              <p className="text-purple-600 text-sm mt-1">
                AI detected 3 potential scheduling conflicts this week. Review and resolve them for optimal efficiency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Calendar Analytics Component
function CalendarAnalytics({ 
  events, 
  stats 
}: { 
  events: CalendarEvent[]
  stats: any
}) {
  // Calculate additional analytics
  const eventTypes = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceBreakdown = stats.sourceBreakdown || {};
  const mostCommonType = Object.entries(eventTypes).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sourceBreakdown).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {source.replace('-', ' ')}
                  </span>
                  <span className="text-lg font-bold text-[#0e6537]">
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(eventTypes).slice(0, 5).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {type.replace('-', ' ')}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-lg font-bold text-green-600">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Duration</span>
                <span className="text-lg font-bold text-purple-600">45m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Utilization</span>
                <span className="text-lg font-bold text-orange-600">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const dayEvents = events.filter(event => {
                  const eventDay = new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long' });
                  return eventDay === day;
                }).length;
                
                return (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#0e6537] h-2 rounded-full" 
                          style={{ width: `${Math.min((dayEvents / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{dayEvents}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(sourceBreakdown).map(([source, count]) => {
                const percentage = ((count as number) / stats.total) * 100;
                return (
                  <div key={source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {source.replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Schedule Optimization</h4>
              <p className="text-blue-600 text-sm mt-1">
                You have 23% more meetings on Tuesdays and Thursdays. Consider distributing them more evenly for better work-life balance.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">Productivity Pattern</h4>
              <p className="text-green-600 text-sm mt-1">
                Your most productive time slots are 10-11 AM and 2-3 PM. Schedule important tasks during these windows.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800">Integration Efficiency</h4>
              <p className="text-purple-600 text-sm mt-1">
                Google Calendar events have 15% higher completion rates than manual entries. Consider using integrations more frequently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 