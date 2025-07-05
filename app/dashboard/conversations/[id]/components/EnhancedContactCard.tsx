import React from 'react';
import { Phone, Mail, MapPin, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { Conversation } from '@/types/conversation';

interface EnhancedContactCardProps {
  conversation: Conversation | null;
  className?: string;
  onCall?: () => void;
  onEmail?: () => void;
  onAddNote?: () => void;
}

export function EnhancedContactCard({ 
  conversation, 
  className,
  onCall,
  onEmail,
  onAddNote
}: EnhancedContactCardProps) {
  if (!conversation?.thread) return null;

  const {
    lead_name: leadName = 'Unknown Lead',
    client_email: clientEmail = 'unknown@email.com',
    phone,
    location
  } = conversation.thread;

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border shadow-sm p-6",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
        <button
          onClick={onAddNote}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Add note"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Avatar and Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0e6537] to-[#0a5a2f] rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-secondary-foreground">
            {leadName[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-semibold text-gray-900 mb-1">{leadName}</h4>
          <p className="text-sm text-gray-500">Lead</p>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-600">{clientEmail}</p>
          </div>
        </div>

        {phone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-600">{phone}</p>
            </div>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600">{location}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCall}
          disabled={!phone}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            phone 
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Phone className="w-4 h-4" />
          Call
        </button>
        <button
          onClick={onEmail}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
      </div>
    </div>
  );
} 