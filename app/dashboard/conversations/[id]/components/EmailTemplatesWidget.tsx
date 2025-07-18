import React, { useState } from 'react';
import { Mail, Copy, Edit, Plus } from 'lucide-react';
import type { Conversation } from '@/lib/types/conversation';
import type { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';
import { cn } from '@/lib/utils/utils';

interface EmailTemplatesWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

const DEFAULT_TEMPLATES = [
  {
    id: 'follow-up',
    name: 'Follow Up',
    subject: 'Following up on your inquiry',
    body: 'Hi {name},\n\nI wanted to follow up on your recent inquiry about {property_type}. I have some great options that might interest you.\n\nWould you be available for a quick call this week to discuss your needs?\n\nBest regards'
  },
  {
    id: 'property-info',
    name: 'Property Info',
    subject: 'Property information you requested',
    body: 'Hi {name},\n\nThank you for your interest in our properties. Based on your requirements:\n\n• Budget: {budget}\n• Property Type: {property_type}\n• Timeline: {timeline}\n\nI have several options that would be perfect for you.\n\nBest regards'
  },
  {
    id: 'schedule-viewing',
    name: 'Schedule Viewing',
    subject: 'Schedule a property viewing',
    body: 'Hi {name},\n\nI have some excellent properties that match your criteria. Would you like to schedule a viewing?\n\nI\'m available:\n• Weekdays: 9 AM - 6 PM\n• Weekends: 10 AM - 4 PM\n\nLet me know what works best for you.\n\nBest regards'
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    subject: 'Thank you for your time',
    body: 'Hi {name},\n\nThank you for taking the time to speak with me today. I\'m excited to help you find the perfect property.\n\nI\'ll send you the listings we discussed shortly.\n\nBest regards'
  }
];

export function EmailTemplatesWidget({ 
  widget,
  conversation, 
  actions,
  state,
  onRemoveWidget,
  onMakeWidgetFloat,
  className 
}: EmailTemplatesWidgetProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (template: typeof DEFAULT_TEMPLATES[0]) => {
    const thread = conversation?.thread;
    if (!thread) return;

    // Replace placeholders with actual data
    let processedBody = template.body
      .replace(/{name}/g, thread.lead_name || 'there')
      .replace(/{property_type}/g, thread.preferred_property_types || 'properties')
      .replace(/{budget}/g, thread.budget_range || 'your budget')
      .replace(/{timeline}/g, thread.timeline || 'your timeline');

    // You could emit this to a parent component or handle it differently
    console.log('Template selected:', {
      subject: template.subject,
      body: processedBody
    });

    // For now, just trigger the email action
    actions.onSendEmail?.();
  };

  const handleCopyTemplate = (template: typeof DEFAULT_TEMPLATES[0]) => {
    const thread = conversation?.thread;
    if (!thread) return;

    let processedBody = template.body
      .replace(/{name}/g, thread.lead_name || 'there')
      .replace(/{property_type}/g, thread.preferred_property_types || 'properties')
      .replace(/{budget}/g, thread.budget_range || 'your budget')
      .replace(/{timeline}/g, thread.timeline || 'your timeline');

    navigator.clipboard.writeText(processedBody);
  };

  return (
    <div className={cn("w-full h-full flex flex-col p-4", className)}>
      <div className="space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Email Templates</h3>
          <Mail className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Templates List */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {DEFAULT_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={cn(
                "p-3 rounded-lg border border-border transition-all duration-200 cursor-pointer",
                "hover:shadow-sm hover:border-primary/20",
                selectedTemplate === template.id ? "bg-primary/5 border-primary/20" : "bg-background"
              )}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">{template.name}</h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTemplate(template);
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Copy template"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Use template"
                  >
                    <Edit className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.subject}
              </p>
            </div>
          ))}
        </div>

        {/* Add Template Button */}
        <div className="pt-2 border-t border-border/40">
          <button
            onClick={() => console.log('Add new template')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        </div>
      </div>
    </div>
  );
} 