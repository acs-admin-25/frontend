import React from 'react';
import { Phone, Mail, MapPin, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { Conversation } from '@/lib/types/conversation';

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
  if (!conversation?.thread) {
    return (
      <div className={cn(
        "bg-card rounded-2xl border border-border shadow-sm p-6",
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Contact</h3>
          <button
            onClick={onAddNote}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Add note"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          No conversation data available
        </div>
      </div>
    );
  }

  const {
    lead_name: leadName = 'Unknown Lead',
    client_email: clientEmail = 'unknown@email.com',
    phone,
    location
  } = conversation.thread;

  return (
    <div className={cn(
      "bg-background rounded-lg p-3 h-full flex flex-col overflow-hidden min-h-[200px]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <button
          onClick={onAddNote}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Add note"
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Avatar and Name */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0e6537] to-[#0a5a2f] rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {leadName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-foreground text-sm truncate">{leadName}</h4>
          <p className="text-xs text-muted-foreground">Lead</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 flex-1 overflow-y-auto min-h-0">
        {clientEmail && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{clientEmail}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onCall}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Call</span>
        </button>
        <button
          onClick={onEmail}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90 transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Email</span>
        </button>
      </div>
    </div>
  );
} 