/**
 * File: components/features/conversations/ConversationMetricsModal.tsx
 * Purpose: Modal component for displaying detailed conversation metrics
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.1.0
 */

import React, { useEffect } from 'react';
import { X, Users, Clock, CheckCircle, AlertCircle, Shield, Mail, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { calculateConversationMetrics, processConversationsData } from '@/lib/api/conversations';
import type { Conversation } from '@/types/conversation';
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationMetricsModalProps {
  conversations: Conversation[];
  isOpen: boolean;
  onClose: () => void;
  modalId?: string;
}

export function ConversationMetricsModal({
  conversations,
  isOpen,
  onClose,
  modalId = 'conversation-metrics-modal'
}: ConversationMetricsModalProps) {
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

  // Process conversations to get enhanced data
  const processedConversations = processConversationsData(conversations);
  const metrics = calculateConversationMetrics(processedConversations);

  const metricCards = [
    {
      title: 'Total Conversations',
      value: metrics.total,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active',
      value: metrics.active,
      icon: Clock,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending',
      value: metrics.pending,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircle,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Flagged',
      value: metrics.flagged,
      icon: Shield,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    // {
    //   title: 'Spam',
    //   value: metrics.spam,
    //   icon: Mail,
    //   color: 'bg-gray-500',
    //   textColor: 'text-gray-600'
    // },
    {
      title: 'Average EV Score',
      value: metrics.averageEVScore.toFixed(1),
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <AnimatePresence>
      {isActuallyOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0.18 }}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-4xl mx-auto overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-card px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Conversation Metrics
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-card px-6 py-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metricCards.map((card, index) => (
                    <motion.div
                      key={index}
                      className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                          card.color
                        )}>
                          <card.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            {card.title}
                          </p>
                          <p className={cn(
                            "text-2xl font-bold",
                            card.textColor
                          )}>
                            {card.value}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Additional insights */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status distribution */}
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      Status Distribution
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Active', value: metrics.active, color: 'bg-green-500' },
                        { label: 'Pending', value: metrics.pending, color: 'bg-yellow-500' },
                        { label: 'Completed', value: metrics.completed, color: 'bg-blue-500' },
                        { label: 'Flagged', value: metrics.flagged, color: 'bg-red-500' },
                        { label: 'Spam', value: metrics.spam, color: 'bg-gray-500' }
                      ].map((status, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{status.label}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className={cn("h-2 rounded-full", status.color)}
                                style={{ 
                                  width: `${metrics.total > 0 ? (status.value / metrics.total) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground w-8 text-right">
                              {status.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EV Score insights */}
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      EV Score Insights
                    </h4>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {metrics.averageEVScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {processedConversations.filter(c => c.evScore && c.evScore >= 80).length}
                          </div>
                          <div className="text-xs text-muted-foreground">High (80+)</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-yellow-600">
                            {processedConversations.filter(c => c.evScore && c.evScore >= 60 && c.evScore < 80).length}
                          </div>
                          <div className="text-xs text-muted-foreground">Medium (60-79)</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-red-600">
                            {processedConversations.filter(c => c.evScore && c.evScore < 60).length}
                          </div>
                          <div className="text-xs text-muted-foreground">Low (&lt;60)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 