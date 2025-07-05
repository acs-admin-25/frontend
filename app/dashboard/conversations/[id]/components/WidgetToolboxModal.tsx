/**
 * Widget Toolbox Modal Component
 * Modal for adding widgets to the conversation view
 * Uses ACS theme colors and follows component standards
 */

import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, Flag, Shield, StickyNote, Zap, BarChart3, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { AVAILABLE_WIDGETS, getWidgetsByCategory } from '@/lib/utils/widgets';
import type { WidgetInstance } from '@/types/widgets';
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface WidgetToolboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidgets: WidgetInstance[];
  onAddWidget: (widgetId: string) => void;
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
  modalId = 'widget-toolbox-modal'
}: WidgetToolboxModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'contact' | 'insights' | 'actions' | 'analytics' | 'tools'>('contact');
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
            <div 
              className="w-full max-w-2xl bg-card border-2 border-border/60 rounded-xl shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/60">
                <h3 className="text-lg font-semibold text-foreground">Widget Toolbox</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex border-b border-border/40">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "flex-1 px-4 py-3 text-sm font-medium transition-colors capitalize",
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Available Widgets */}
              <div className="max-h-96 overflow-y-auto p-6 scrollbar-acs">
                {availableToAdd.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-border/60">
                      <X className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-2">All widgets added</h4>
                    <p className="text-sm text-muted-foreground">
                      All {selectedCategory} widgets are already in your layout
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {availableToAdd.map(widget => (
                      <motion.button
                        key={widget.id}
                        onClick={() => handleAddWidget(widget.id)}
                        className="flex flex-col items-center gap-3 p-4 bg-card border-2 border-border/60 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
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
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                              {widget.size}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  {availableToAdd.length} widget{availableToAdd.length !== 1 ? 's' : ''} available
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