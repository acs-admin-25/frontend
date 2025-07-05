/**
 * Contact Widget Content Component
 * Contains only the contact-specific content without header controls
 */

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { getInitials } from '@/lib/utils/formatting';
import type { WidgetActions } from '@/types/widgets';
import type { Conversation } from '@/types/conversation';

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
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="space-y-2 flex-1">
        {/* Contact Avatar and Name */}
        <div className="flex items-center gap-2 p-2 bg-card border border-border/40 rounded-md">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-foreground">
              {leadInitials || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{leadName}</p>
            <p className="text-xs text-muted-foreground truncate">{clientEmail}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border/40 rounded-md">
            <div className="w-4 h-4 bg-muted rounded flex items-center justify-center border border-border/40 flex-shrink-0">
              <Mail className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">Email</p>
              <p className="text-xs text-muted-foreground truncate">{clientEmail}</p>
            </div>
          </div>

          {phone && (
            <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border/40 rounded-md">
              <div className="w-4 h-4 bg-muted rounded flex items-center justify-center border border-border/40 flex-shrink-0">
                <Phone className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">Phone</p>
                <p className="text-xs text-muted-foreground truncate">{phone}</p>
              </div>
            </div>
          )}

          {location && (
            <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border/40 rounded-md">
              <div className="w-4 h-4 bg-muted rounded flex items-center justify-center border border-border/40 flex-shrink-0">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">Location</p>
                <p className="text-xs text-muted-foreground truncate">{location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 pt-1.5 mt-auto">
          <button
            onClick={actions.onCall}
            disabled={!phone}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs font-medium transition-colors",
              phone 
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Phone className="w-2.5 h-2.5" />
            Call
          </button>
          <button
            onClick={actions.onEmail}
            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors text-xs font-medium"
          >
            <Mail className="w-2.5 h-2.5" />
            Email
          </button>
        </div>
      </div>
    </div>
  );
} 