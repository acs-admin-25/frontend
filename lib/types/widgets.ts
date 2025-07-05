/**
 * Widget System Types for ACS Next.js
 * Defines the structure for the widget toolbox system
 */

import type { Conversation } from './conversation';

export type WidgetSize = '1x1' | '1x2' | '1x3' | '1x4';

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  size: WidgetSize;
  icon: string; // Lucide icon name
  category: 'contact' | 'insights' | 'actions' | 'analytics' | 'tools';
  enabled: boolean;
  order: number;
}

export interface WidgetInstance {
  id: string;
  widgetId: string;
  config: WidgetConfig;
  position: { x: number; y: number }; // Grid position or floating position
  isVisible: boolean;
  isFloating?: boolean; // Whether widget is floating outside the column
  settings?: Record<string, any>;
}

export interface WidgetLayout {
  columns: number;
  rows: number;
  widgets: WidgetInstance[];
}

export interface GridCell {
  x: number;
  y: number;
  occupied: boolean;
  widgetId?: string;
}

export interface GridLayout {
  cells: GridCell[][];
  columns: number;
  rows: number;
}

// Widget action handlers
export interface WidgetActions {
  onCall?: () => void;
  onEmail?: () => void;
  onAddNote?: () => void;
  onUnflag?: () => void;
  onComplete?: () => void;
  onClearFlag?: () => void;
  onMarkAsNotSpam?: () => void;
  onGenerateResponse?: () => void;
  onSendEmail?: () => void;
  onOverride?: () => void;
  onReport?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
  onEvFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

// Widget state
export interface WidgetState {
  updating?: boolean;
  unflagging?: boolean;
  clearingFlag?: boolean;
  completingConversation?: boolean;
  updatingSpam?: boolean;
  reportingResponse?: boolean;
  generatingResponse?: boolean;
  sendingEmail?: boolean;
  updatingOverride?: boolean;
  updatingFeedbackId?: string | null;
  updatingEvFeedbackId?: string | null;
}

// Widget props base interface
export interface BaseWidgetProps {
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  className?: string;
}

// Specific widget props - now using the new structure
export interface ContactWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export interface AIInsightsWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export interface FlaggedStatusWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export interface SpamStatusWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export interface NotesWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export interface QuickActionsWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export interface ConversationMetricsWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export interface EmailTemplatesWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
} 