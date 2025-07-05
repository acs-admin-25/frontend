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
import type { 
  CalendarEvent, 
  AvailabilitySlot, 
  EventType, 
  EventStatus,
  CalendarIntegration as CalendarIntegrationType,
  AISchedulingPreferences,
  CalendarFilters
} from "@/lib/types/calendar"
import { CalendarIntegration } from "../CalendarIntegration"

export default function CalendarContent() {
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

  // Use the centralized calendar data hook
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
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    enableGoogle: true,
    enableCalendly: true,
    filters
  })

  // Filter events based on search term
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get current month events for calendar grid
  const getCurrentMonthEvents = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    })
  }

  const currentMonthEvents = getCurrentMonthEvents()

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= now && eventDate <= nextWeek
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  const upcomingEvents = getUpcomingEvents()

  // Get today's events
  const getTodayEvents = () => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= todayStart && eventDate < todayEnd
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  const todayEvents = getTodayEvents()

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

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
                onClick={refetch}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
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
                        <CalendarGrid 
                          events={currentMonthEvents} 
                          onEventClick={setSelectedEvent}
                          view={view}
                        />
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
                          onEventClick={setSelectedEvent}
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
                          onEventClick={setSelectedEvent}
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
                          onClick={() => setShowEventModal(true)} 
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
              <CalendarIntegration />
            </TabsContent>

            <TabsContent value="ai-scheduling" className="h-full p-6 overflow-auto">
              <AISchedulingPanel />
            </TabsContent>

            <TabsContent value="analytics" className="h-full p-6 overflow-auto">
              <CalendarAnalytics events={events} stats={stats} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Calendar Grid Component
function CalendarGrid({ 
  events, 
  onEventClick,
  view
}: { 
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  view: 'month' | 'week' | 'day' | 'agenda'
}) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push(date)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.toDateString() === date.toDateString()
    })
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
          const isCurrentMonth = date.getMonth() === currentMonth
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
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="text-xs p-1 rounded bg-[#0e6537]/10 text-[#0e6537] cursor-pointer hover:bg-[#0e6537]/20 transition-colors truncate"
                    title={event.title}
                  >
                    {new Date(event.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {event.title}
                  </div>
                ))}
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
                  {new Date(event.startTime).toLocaleDateString()} at{' '}
                  {new Date(event.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {event ? 'Edit Event' : 'New Event'}
        </h2>
        <p className="text-gray-600 mb-4">Event modal implementation needed</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          {event && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => onSave({ title: 'Test Event' })}
            className="px-4 py-2 bg-[#0e6537] text-white rounded-lg hover:bg-[#157a42]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
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