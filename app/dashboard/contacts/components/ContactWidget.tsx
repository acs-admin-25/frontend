/**
 * Contact Widget Component
 * Displays lead contact information and quick actions
 */

import React from 'react';
import { ContactWidgetContent } from './ContactWidgetContent';
import { BaseWidget } from '@/components/features/widgets/BaseWidget';
import { Conversation } from '@/lib/types/conversation';
import { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';

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
    <BaseWidget
      widget={widget}
      conversation={conversation}
      actions={actions}
      state={state}
      onRemoveWidget={onRemoveWidget}
      onMakeWidgetFloat={onMakeWidgetFloat}
      className={className}
    >
      <ContactWidgetContent
        conversation={conversation}
        actions={actions}
        className="w-full h-full"
      />
    </BaseWidget>
  );
} 