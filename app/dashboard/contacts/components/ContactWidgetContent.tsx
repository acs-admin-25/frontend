/**
 * Contact Widget Content Component
 * Contains only the contact-specific content without header controls
 */

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { getInitials } from '@/lib/utils/formatting';
import type { WidgetActions } from '@/lib/types/widgets';
import type { Conversation } from '@/lib/types/conversation';

interface ContactWidgetContentProps {
  conversation: Conversation | null;
  actions: WidgetActions;
  className?: string;
}

export function ContactWidgetContent({ 
  conversation, 
  actions,
  className 
}: ContactWidgetContentProps) {
  if (!conversation?.thread) return null;

  const {
    lead_name: leadName = 'Unknown Lead',
    client_email: clientEmail = 'unknown@email.com',
    phone,
    location
  } = conversation.thread;

  const leadInitials = getInitials(leadName);

  return (
    <div className={cn("w-full h-full flex flex-col p-4", className)}>
      <div className="space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        </div>

        {/* Contact Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-foreground">
              {leadInitials || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{leadName}</p>
            <p className="text-xs text-muted-foreground truncate">{clientEmail}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 mt-auto">
          <button
            onClick={actions.onCall}
            disabled={!phone}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              phone 
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Phone className="w-4 h-4" />
            Call
          </button>
          <button
            onClick={actions.onEmail}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
      </div>
    </div>
  );
} 