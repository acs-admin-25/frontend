import React from 'react';
import { Phone, MapPin } from "lucide-react"
import type { Thread } from '@/types/conversation'

/**
 * Client Information Component
 * Displays client details in a card format
 */
export function ClientInfo({ thread }: { thread: Thread | null }) {
  if (!thread) return null;

  const leadName = thread.lead_name || 'Unknown Lead';
  const clientEmail = thread.client_email || 'unknown@email.com';

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-[#0e6537]/10 rounded-full flex items-center justify-center mb-3">
        <span className="text-2xl font-semibold text-[#0e6537]">{leadName[0]?.toUpperCase()}</span>
      </div>
      <div className="mb-1 font-bold text-lg">{leadName}</div>
      <div className="text-gray-500 text-sm mb-3">{clientEmail}</div>
      {thread.phone && (
        <div className="text-gray-500 text-sm mb-2 flex items-center justify-center gap-1">
          <Phone className="h-4 w-4" />
          {thread.phone}
        </div>
      )}
      {thread.location && (
        <div className="text-gray-500 text-sm mb-2 flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4" />
          {thread.location}
        </div>
      )}
    </div>
  );
} 