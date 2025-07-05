/**
 * File: app/dashboard/calendar/page.tsx
 * Purpose: Renders the calendar dashboard with event management, scheduling, and upcoming events display.
 * Author: Alejo Cagliolo
 * Date: 5/25/25
 * Version: 1.0.0
 */

"use client"
import { ArrowLeft, Search, Calendar, Filter, Plus, Clock, MapPin, Users, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Logo } from "@/app/utils/Logo"
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import CalendarContent from './component/CalendarContent';

/**
 * CalendarPage Component
 * Main calendar dashboard component for managing and viewing events
 * 
 * Features:
 * - Event search and filtering
 * - Calendar grid view
 * - Upcoming events list
 * - Event status and type indicators
 * 
 * @returns {JSX.Element} Complete calendar dashboard
 */
export default function CalendarPage() {
  return (
    <div className="h-full overflow-hidden">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <CalendarContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

/**
 * Change Log:
 * 5/25/25 - Initial version
 * - Created calendar dashboard with grid view
 * - Implemented event search and filtering
 * - Added upcoming events list
 * - Integrated event status and type indicators
 * - Added responsive design for all screen sizes
 */
