/**
 * Contact Widget Component
 * Displays lead contact information and quick actions
 */

import React from 'react';
import { ContactWidgetContent } from './ContactWidgetContent';
import { Conversation } from '@/lib/types/conversation';
import { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';
import { cn } from '@/lib/utils/utils';

interface ContactWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export function ContactWidget({ 
  widget,
  conversation, 
  actions,
  state,
  onRemoveWidget,
  onMakeWidgetFloat,
  className 
}: ContactWidgetProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ContactWidgetContent
        conversation={conversation}
        actions={actions}
        className="w-full h-full"
      />
    </div>
  );
} 