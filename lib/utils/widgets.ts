/**
 * Widget Configuration and Utilities
 * Defines all available widgets and their settings
 */

import type { WidgetConfig } from '@/types/widgets';

// Available widgets configuration
export const AVAILABLE_WIDGETS: WidgetConfig[] = [
  {
    id: 'contact',
    name: 'Contact Info',
    description: 'Display lead contact information and quick actions',
    size: '1x1',
    icon: 'User',
    category: 'contact',
    enabled: true,
    order: 1
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    description: 'AI-powered conversation analysis and extracted information',
    size: '1x3',
    icon: 'Sparkles',
    category: 'insights',
    enabled: true,
    order: 2
  },
  {
    id: 'flagged-status',
    name: 'Flagged Status',
    description: 'Manage conversation flags and completion status',
    size: '1x1',
    icon: 'Flag',
    category: 'actions',
    enabled: true,
    order: 3
  },
  {
    id: 'spam-status',
    name: 'Spam Status',
    description: 'Manage spam detection and filtering',
    size: '1x1',
    icon: 'Shield',
    category: 'actions',
    enabled: true,
    order: 4
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Add and manage conversation notes',
    size: '1x2',
    icon: 'StickyNote',
    category: 'tools',
    enabled: true,
    order: 5
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    description: 'Common actions and shortcuts',
    size: '1x1',
    icon: 'Zap',
    category: 'actions',
    enabled: true,
    order: 6
  },
  {
    id: 'conversation-metrics',
    name: 'Conversation Metrics',
    description: 'Key metrics and statistics for this conversation',
    size: '1x2',
    icon: 'BarChart3',
    category: 'analytics',
    enabled: true,
    order: 7
  },
  {
    id: 'email-templates',
    name: 'Email Templates',
    description: 'Quick access to email templates and responses',
    size: '1x2',
    icon: 'Mail',
    category: 'tools',
    enabled: true,
    order: 8
  }
];

// Default widget layout
export const DEFAULT_WIDGET_LAYOUT = [
  'contact',
  'ai-insights',
  'flagged-status',
  'spam-status',
  'notes',
  'quick-actions'
];

// Widget size dimensions for single column layout
export const WIDGET_SIZE_DIMENSIONS = {
  '1x1': { width: 1, height: 1 },
  '1x2': { width: 1, height: 2 },
  '1x3': { width: 1, height: 3 },
  '1x4': { width: 1, height: 4 }
};

// Get widget by ID
export function getWidgetById(id: string): WidgetConfig | undefined {
  return AVAILABLE_WIDGETS.find(widget => widget.id === id);
}

// Get widgets by category
export function getWidgetsByCategory(category: WidgetConfig['category']): WidgetConfig[] {
  return AVAILABLE_WIDGETS.filter(widget => widget.category === category);
}

// Get enabled widgets
export function getEnabledWidgets(): WidgetConfig[] {
  return AVAILABLE_WIDGETS.filter(widget => widget.enabled);
}

// Validate widget layout
export function validateWidgetLayout(widgetIds: string[]): boolean {
  return widgetIds.every(id => getWidgetById(id) !== undefined);
}

// Calculate layout grid size for single column layout
export function calculateLayoutGridSize(widgetIds: string[]): { columns: number; rows: number } {
  let totalRows = 0;
  
  widgetIds.forEach(id => {
    const widget = getWidgetById(id);
    if (widget) {
      const { height } = WIDGET_SIZE_DIMENSIONS[widget.size];
      totalRows += height;
    }
  });
  
  // Always return 1 column for single column layout
  return { columns: 1, rows: totalRows };
} 