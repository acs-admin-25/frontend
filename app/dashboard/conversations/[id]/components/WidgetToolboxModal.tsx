/**
 * Widget Toolbox Modal Component
 * Modal for adding widgets to the conversation view
 * Uses ACS theme colors and follows component standards
 */

import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, Flag, Shield, StickyNote, Zap, BarChart3, Mail, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { AVAILABLE_WIDGETS, getWidgetsByCategory } from '@/lib/utils/widgets';
import type { WidgetInstance } from '@/lib/types/widgets';
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface WidgetToolboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidgets: WidgetInstance[];
  onAddWidget: (widgetId: string) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onToggleWidgetVisibility?: (widgetId: string) => void;
  modalId?: string;
}

// Icon mapping for widgets
const WIDGET_ICONS = {
  'contact': User,
  'ai-insights': Sparkles,
  'flagged-status': Flag,
  'spam-status': Shield,
  'notes': StickyNote,
  'quick-actions': Zap,
  'conversation-metrics': BarChart3,
  'email-templates': Mail,
} as const;

// Color mapping for widget categories using ACS theme colors
const CATEGORY_COLORS = {
  'contact': 'bg-primary/10 text-primary border-primary/20',
  'insights': 'bg-secondary/10 text-secondary border-secondary/20',
  'actions': 'bg-status-success/10 text-status-success border-status-success/20',
  'analytics': 'bg-status-warning/10 text-status-warning border-status-warning/20',
  'tools': 'bg-muted text-muted-foreground border-border',
} as const;

export function WidgetToolboxModal({
  isOpen,
  onClose,
  currentWidgets,
  onAddWidget,
  onRemoveWidget,
  onToggleWidgetVisibility,
  modalId = 'widget-toolbox-modal'
}: WidgetToolboxModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'contact' | 'insights' | 'actions' | 'analytics' | 'tools'>('contact');
  const [activeTab, setActiveTab] = useState<'current' | 'available'>('current');
  const { activeModal, openModal, closeModal } = useModal();
  
  // Use global modal state
  const isActuallyOpen = isOpen && activeModal === modalId;

  useEffect(() => {
    if (isOpen) {
      openModal(modalId);
    } else {
      closeModal(modalId);
    }
  }, [isOpen, modalId, openModal, closeModal]);
  
  const categories = ['contact', 'insights', 'actions', 'analytics', 'tools'] as const;
  const availableWidgets = getWidgetsByCategory(selectedCategory);
  const currentWidgetIds = currentWidgets.map(w => w.widgetId);
  const availableToAdd = availableWidgets.filter(w => !currentWidgetIds.includes(w.id));

  const getWidgetIcon = (widgetId: string) => {
    const IconComponent = WIDGET_ICONS[widgetId as keyof typeof WIDGET_ICONS];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <div className="w-4 h-4 bg-muted rounded" />;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.tools;
  };

  const handleAddWidget = (widgetId: string) => {
    onAddWidget(widgetId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isActuallyOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0.18 }}
            aria-modal="true"
            role="dialog"
          >
            <div className="bg-card rounded-2xl shadow-2xl border border-border/60 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/40 bg-muted/30">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Widget Manager</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage your conversation widgets</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border/40 bg-muted/20">
                <button
                  onClick={() => setActiveTab('current')}
                  className={cn(
                    "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                    activeTab === 'current'
                      ? "text-primary border-b-2 border-primary bg-background/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Current Widgets ({currentWidgets.length})
                </button>
                <button
                  onClick={() => setActiveTab('available')}
                  className={cn(
                    "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                    activeTab === 'available'
                      ? "text-primary border-b-2 border-primary bg-background/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Add Widgets
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === 'current' ? (
                  <div className="space-y-4">
                    {currentWidgets.length === 0 ? (
                      <div className="text-center py-12">
                        <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No widgets added</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add some widgets to customize your conversation view
                        </p>
                        <button
                          onClick={() => setActiveTab('available')}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          Browse Widgets
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {currentWidgets.map(widget => (
                          <div
                            key={widget.id}
                            className="flex items-center gap-4 p-4 bg-background border border-border/60 rounded-lg"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center border",
                              getCategoryColor(widget.config.category)
                            )}>
                              {getWidgetIcon(widget.widgetId)}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-foreground">
                                {widget.config.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {widget.config.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {onToggleWidgetVisibility && (
                                <button
                                  onClick={() => onToggleWidgetVisibility(widget.id)}
                                  className={cn(
                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                    widget.isVisible
                                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  )}
                                >
                                  {widget.isVisible ? 'Visible' : 'Hidden'}
                                </button>
                              )}
                              {onRemoveWidget && (
                                <button
                                  onClick={() => onRemoveWidget(widget.id)}
                                  className="p-2 text-muted-foreground hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors"
                                  title="Remove widget"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                            selectedCategory === category
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Available widgets */}
                    {availableToAdd.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Grid3X3 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">All widgets added</h3>
                        <p className="text-sm text-muted-foreground">
                          You've already added all available {selectedCategory} widgets
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {availableToAdd.map(widget => (
                          <motion.button
                            key={widget.id}
                            onClick={() => handleAddWidget(widget.id)}
                            className="flex flex-col items-center gap-3 p-4 bg-background border border-border/60 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                              getCategoryColor(widget.category)
                            )}>
                              {getWidgetIcon(widget.id)}
                            </div>
                            <div className="text-center">
                              <h4 className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                                {widget.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                                {widget.description}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'current' 
                    ? `${currentWidgets.length} widget${currentWidgets.length !== 1 ? 's' : ''} active`
                    : `${availableToAdd.length} widget${availableToAdd.length !== 1 ? 's' : ''} available`
                  }
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 