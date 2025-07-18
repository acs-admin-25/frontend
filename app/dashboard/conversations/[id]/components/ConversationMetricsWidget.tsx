import React from 'react';
import { BarChart3, MessageCircle, Clock, TrendingUp, User, Mail, Calendar, Zap, Target, Activity } from 'lucide-react';
import type { Conversation } from '@/lib/types/conversation';
import type { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';
import { cn } from '@/lib/utils/utils';

interface ConversationMetricsWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export function ConversationMetricsWidget({ 
  widget,
  conversation, 
  actions,
  state,
  onRemoveWidget,
  onMakeWidgetFloat,
  className 
}: ConversationMetricsWidgetProps) {
  if (!conversation) {
    return (
      <div className={cn("w-full h-full flex flex-col p-4", className)}>
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Conversation Metrics</h3>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No conversation data available</p>
          </div>
        </div>
      </div>
    );
  }

  const { thread, messages } = conversation;
  
  // Calculate comprehensive metrics
  const totalMessages = messages.length;
  const clientMessages = messages.filter(m => m.type === 'inbound-email').length;
  const aiMessages = messages.filter(m => m.type === 'outbound-email').length;
  
  // EV Score analysis
  const messagesWithEvScore = messages.filter(m => m.type === 'inbound-email' && typeof m.ev_score === 'number');
  const averageEvScore = messagesWithEvScore.length > 0 
    ? Math.round(messagesWithEvScore.reduce((sum, m) => sum + (m.ev_score || 0), 0) / messagesWithEvScore.length)
    : 0;
  
  const highEvMessages = messagesWithEvScore.filter(m => (m.ev_score || 0) >= 80).length;
  const lowEvMessages = messagesWithEvScore.filter(m => (m.ev_score || 0) < 40).length;
  
  // Time analysis
  const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const conversationDuration = sortedMessages.length > 1 
    ? Math.round((new Date(sortedMessages[sortedMessages.length - 1].timestamp).getTime() - new Date(sortedMessages[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const lastMessageDate = sortedMessages.length > 0 
    ? new Date(sortedMessages[sortedMessages.length - 1].timestamp).toLocaleDateString()
    : 'N/A';

  const metrics = [
    {
      label: 'Total Messages',
      value: totalMessages,
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All messages in conversation'
    },
    {
      label: 'Client Messages',
      value: clientMessages,
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Messages from client'
    },
    {
      label: 'AI Responses',
      value: aiMessages,
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'AI-generated responses'
    },
    {
      label: 'Avg EV Score',
      value: averageEvScore > 0 ? averageEvScore : 'N/A',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Average engagement score'
    }
  ];

  const engagementMetrics = [
    {
      label: 'High Engagement',
      value: highEvMessages,
      icon: Zap,
      color: 'text-status-success',
      description: 'Messages with EV ≥ 80'
    },
    {
      label: 'Low Engagement',
      value: lowEvMessages,
      icon: Target,
      color: 'text-status-error',
      description: 'Messages with EV < 40'
    }
  ];

  return (
    <div className={cn("w-full h-full flex flex-col p-4", className)}>
      <div className="space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Conversation Metrics</h3>
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className={cn("flex flex-col items-center p-3 rounded-lg border", metric.bgColor, "border-border/40")}>
                <div className="flex items-center gap-2 mb-1">
                  <IconComponent className={cn("w-4 h-4", metric.color)} />
                </div>
                <div className="text-lg font-bold text-foreground">{metric.value}</div>
                <div className="text-xs text-muted-foreground text-center">{metric.label}</div>
                <div className="text-xs text-muted-foreground text-center mt-1 opacity-75">{metric.description}</div>
              </div>
            );
          })}
        </div>

        {/* Engagement Analysis */}
        {messagesWithEvScore.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-3">
            <h4 className="text-xs font-medium text-foreground mb-2">Engagement Analysis</h4>
            <div className="grid grid-cols-2 gap-2">
              {engagementMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <IconComponent className={cn("w-3 h-3", metric.color)} />
                    <span className="text-muted-foreground">{metric.label}:</span>
                    <span className="font-medium text-foreground">{metric.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Information */}
        <div className="bg-muted/30 rounded-lg p-3">
          <h4 className="text-xs font-medium text-foreground mb-2">Time Information</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium text-foreground">
                {conversationDuration > 0 ? `${conversationDuration} days` : 'Same day'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Message:</span>
              <span className="font-medium text-foreground">{lastMessageDate}</span>
            </div>
          </div>
        </div>

        {/* Conversation Status */}
        <div className="pt-2 border-t border-border/40">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className={cn(
                "font-medium px-2 py-1 rounded-full text-xs",
                thread.completed 
                  ? "bg-status-success/20 text-status-success" 
                  : "bg-blue-100 text-blue-700"
              )}>
                {thread.completed ? 'Completed' : 'Active'}
              </span>
            </div>
            {thread.priority && (
              <div className="flex justify-between items-center">
                <span>Priority:</span>
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
            {thread.lcp_enabled && (
              <div className="flex justify-between items-center">
                <span>AI Assistant:</span>
                <span className="font-medium text-status-success">Enabled</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 