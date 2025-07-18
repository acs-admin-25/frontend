import React from 'react';
import { Zap, Phone, Mail, MessageCircle, Flag, CheckCircle, AlertTriangle, Copy, FileText, Download, Star, Clock } from 'lucide-react';
import type { Conversation } from '@/lib/types/conversation';
import type { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';
import { cn } from '@/lib/utils/utils';

interface QuickActionsWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export function QuickActionsWidget({ 
  widget,
  conversation, 
  actions,
  state,
  onRemoveWidget,
  onMakeWidgetFloat,
  className 
}: QuickActionsWidgetProps) {
  const thread = conversation?.thread;
  const isFlagged = thread?.flag_for_review || thread?.flag || false;
  const isSpam = thread?.spam || false;
  const isCompleted = thread?.completed || false;
  const hasPhone = thread?.phone && thread.phone.trim() !== '';

  const primaryActions = [
    {
      label: 'Call Client',
      icon: Phone,
      action: actions.onCall,
      disabled: !hasPhone,
      color: 'text-blue-600 hover:bg-blue-50',
      description: hasPhone ? 'Call the client directly' : 'No phone number available',
      badge: hasPhone ? undefined : 'No Phone'
    },
    {
      label: 'Send Email',
      icon: Mail,
      action: actions.onEmail,
      disabled: false,
      color: 'text-green-600 hover:bg-green-50',
      description: 'Compose and send an email',
      badge: undefined
    },
    {
      label: 'Generate AI Response',
      icon: MessageCircle,
      action: actions.onGenerateResponse,
      disabled: state.generatingResponse,
      color: 'text-purple-600 hover:bg-purple-50',
      description: state.generatingResponse ? 'Generating response...' : 'Create AI-powered response',
      badge: state.generatingResponse ? 'Generating' : undefined
    },
    {
      label: isFlagged ? 'Clear Flag' : 'Flag for Review',
      icon: Flag,
      action: isFlagged ? actions.onUnflag : () => console.log('Flag action'),
      disabled: state.unflagging,
      color: isFlagged ? 'text-orange-600 hover:bg-orange-50' : 'text-gray-600 hover:bg-gray-50',
      description: isFlagged ? 'Remove review flag' : 'Mark for human review',
      badge: state.unflagging ? 'Updating' : undefined
    },
  ];

  const secondaryActions = [
    {
      label: 'Add Notes',
      icon: Star,
      action: actions.onAddNote,
      disabled: false,
      color: 'text-muted-foreground hover:bg-muted',
      description: 'Add internal notes'
    },
    {
      label: 'Complete',
      icon: CheckCircle,
      action: actions.onComplete,
      disabled: isCompleted || state.completingConversation,
      color: isCompleted ? 'text-status-success' : 'text-muted-foreground hover:bg-muted',
      description: isCompleted ? 'Already completed' : 'Mark conversation as complete'
    },
  ];

  return (
    <div className={cn("w-full h-full flex flex-col p-4", className)}>
      <div className="space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          <Zap className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Primary Actions */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Primary Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {primaryActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  disabled={action.disabled}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border border-border transition-all duration-200 relative",
                    "hover:shadow-sm active:scale-95",
                    action.disabled 
                      ? "opacity-50 cursor-not-allowed bg-muted/50" 
                      : `${action.color} bg-background hover:border-current/20`
                  )}
                  title={action.description}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                  {action.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      {action.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Actions */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Additional Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {secondaryActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  disabled={action.disabled}
                  className={cn(
                    "flex flex-col items-center gap-2 p-2.5 rounded-lg border border-border transition-all duration-200",
                    "hover:shadow-sm active:scale-95",
                    action.disabled 
                      ? "opacity-50 cursor-not-allowed bg-muted/50" 
                      : `${action.color} bg-background hover:border-current/20`
                  )}
                  title={action.description}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-muted/30 rounded-lg p-3">
          <h4 className="text-xs font-medium text-foreground mb-2">Conversation Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={cn(
                "font-medium px-2 py-1 rounded-full text-xs",
                isCompleted ? "bg-status-success/20 text-status-success" :
                isFlagged ? "bg-warning/20 text-warning" :
                "bg-blue-100 text-blue-700"
              )}>
                {isCompleted ? 'Completed' : isFlagged ? 'Flagged' : 'Active'}
              </span>
            </div>
            {isSpam && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Spam:</span>
                <span className="font-medium px-2 py-1 rounded-full text-xs bg-status-error/20 text-status-error">
                  Marked as Spam
                </span>
              </div>
            )}
            {thread?.priority && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <span className={cn(
                  "font-medium px-2 py-1 rounded-full text-xs",
                  thread.priority === 'high' ? "bg-status-error/20 text-status-error" :
                  thread.priority === 'medium' ? "bg-warning/20 text-warning" :
                  "bg-status-success/20 text-status-success"
                )}>
                  {thread.priority.charAt(0).toUpperCase() + thread.priority.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-muted/30 rounded-lg p-3">
          <h4 className="text-xs font-medium text-foreground mb-2">Quick Tips</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Use AI responses for quick, professional replies</span>
            </div>
            <div className="flex items-start gap-2">
              <Flag className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Flag conversations that need human attention</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Complete conversations when all needs are met</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 