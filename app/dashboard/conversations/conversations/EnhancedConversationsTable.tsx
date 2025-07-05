/**
 * File: components/features/conversations/EnhancedConversationsTable.tsx
 * Purpose: Enhanced conversations table with bulk actions, advanced filtering, and sorting
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.1.0
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronUp, 
  ChevronDown, 
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle,
  MoreHorizontal,
  Clock,
  AlertCircle,
  Shield,
  Mail,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { 
  processConversationsData,
  filterConversations,
  sortConversations,
  getStatusColor,
  getEVScoreColor,
  type ProcessedConversation,
  type SortConfig,
  type ConversationFilters
} from '@/lib/api/conversations';
import { useConversationBulkActions } from '@/lib/hooks/useConversationBulkActions';
import type { Conversation } from '@/types/conversation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { EVScoreInfoContent } from '@/app/dashboard/analytics/components/EVScoreInfoContent';
import { EVScoreInfoModal } from '@/app/dashboard/analytics/components/EVScoreInfoModal';

interface EnhancedConversationsTableProps {
  conversations: Conversation[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export function EnhancedConversationsTable({
  conversations,
  loading = false,
  error = null,
  onRefresh,
  className
}: EnhancedConversationsTableProps) {
  const router = useRouter();
  const bulkActions = useConversationBulkActions();
  
  // Local state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'lastMessage', direction: 'desc' });
  const [filters, setFilters] = useState<ConversationFilters>({
    status: [],
    evScoreRange: [0, 100],
    dateRange: [null, null],
    searchQuery: '',
    showPendingOnly: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showEVModal, setShowEVModal] = useState(false);
  const [modalScore, setModalScore] = useState<number | null>(null);

  // Process conversations with enhanced data
  const processedConversations = useMemo(() => {
    return processConversationsData(conversations);
  }, [conversations]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return filterConversations(processedConversations, filters);
  }, [processedConversations, filters]);

  // Sort conversations
  const sortedConversations = useMemo(() => {
    return sortConversations(filteredConversations, sortConfig);
  }, [filteredConversations, sortConfig]);

  // Sort handlers
  const handleSort = (field: SortConfig['field']) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter handlers
  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status as any)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status as any]
    }));
  };

  const handlePendingOnlyToggle = () => {
    setFilters(prev => ({ ...prev, showPendingOnly: !prev.showPendingOnly }));
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    if (bulkActions.selectedIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${bulkActions.selectedIds.length} conversation(s)?`)) {
      await bulkActions.deleteSelected();
    }
  };

  const handleBulkComplete = async () => {
    if (bulkActions.selectedIds.length === 0) return;
    await bulkActions.markSelectedComplete();
  };

  const handleBulkAddNote = async () => {
    if (bulkActions.selectedIds.length === 0) return;
    
    const note = prompt('Enter note to add to selected conversations:');
    if (note) {
      await bulkActions.addNoteToSelected(note);
    }
  };

  // Row click handler
  const handleRowClick = (conversationId: string) => {
    if (conversationId) {
      router.push(`/dashboard/conversations/${conversationId}`);
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'flagged':
        return <Shield className="w-4 h-4" />;
      case 'spam':
        return <Mail className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className={cn("bg-white rounded-lg shadow-sm p-6 h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-sm h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0 mb-1">{/* Decrease bottom margin from default to mb-2 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {/* Removed the old reload button from here */}
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black bg-[#ededed] rounded" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#ededed] text-black placeholder-black"
            />
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="px-3 py-2 text-sm rounded-lg transition-colors bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
                title="Reload Conversations"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")}/>
                <span>Reload</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters and Bulk Actions - now on the same row */}
        <div className="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="flex flex-row gap-2 w-auto max-w-2xl">
            {['active', 'pending', 'completed', 'flagged'].map(status => {
              // Always count from processedConversations, not filteredConversations
              const count = processedConversations.filter(c => c.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={cn(
                    "px-5 py-2 text-base rounded-lg transition-colors max-w-xs w-full min-w-[140px] whitespace-nowrap border border-gray-200 bg-gray-200 hover:bg-gray-300",
                    filters.status.includes(status as any)
                      ? "bg-white border-blue-200 text-blue-800 hover:bg-white"
                      : "text-gray-700"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              );
            })}
          </div>
          {bulkActions.selectedIds.length > 0 && (
            <div className="flex flex-row items-center gap-2 ml-0 sm:ml-4 mt-2 sm:mt-0 bg-blue-50 rounded-lg border border-blue-200 px-4 py-2 sm:ml-auto">{/* sm:ml-auto to right align on row */}
              <span className="text-sm font-medium text-blue-800 whitespace-nowrap">
                {bulkActions.selectedIds.length} conversation(s) selected
              </span>
              <button
                onClick={handleBulkAddNote}
                disabled={bulkActions.isProcessing}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <Edit3 className="w-4 h-4" />
                <span>Add Note</span>
              </button>
              <button
                onClick={handleBulkComplete}
                disabled={bulkActions.isProcessing}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Complete</span>
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActions.isProcessing}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Table Header */}
        <div className="flex-shrink-0">
          {/* Titles Row - perfectly aligned with table columns */}
          <div className="grid grid-cols-12 w-full mb-0">
            <div className="col-span-3 flex items-center justify-center px-6 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</span>
            </div>
            <div className="col-span-2 flex items-center justify-center px-2 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
            </div>
            <div className="col-span-2 flex items-center justify-center px-3 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Message</span>
            </div>
            <div className="col-span-2 flex items-center justify-center px-3 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
            </div>
            <div className="col-span-2 flex items-center justify-center px-10 py-2">{/* px-10 for further right shift of EV Score column */}
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">EV Score</span>
            </div>
            <div className="col-span-1 flex items-center justify-center px-3 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</span>
            </div>
          </div>
          {/* Table Header (for accessibility/screen readers only) */}
          <table className="w-full" style={{ display: 'none' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-1/4">Lead</th>
                <th className="px-3 py-3 w-1/5">Email</th>
                <th className="px-3 py-3 w-1/6">Last Message</th>
                <th className="px-3 py-3 w-1/6">Status</th>
                <th className="px-3 py-3 w-1/6">EV Score</th>
                <th className="px-3 py-3 w-1/12">Messages</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full">
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading conversations...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedConversations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No conversations found
                  </td>
                </tr>
              ) : (
                sortedConversations.map((conversation) => (
                  <tr
                    key={conversation.thread.conversation_id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => { if (!showEVModal) handleRowClick(conversation.thread.conversation_id); }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap w-12 text-center">
                      <input
                        type="checkbox"
                        checked={bulkActions.selectedIds.includes(conversation.thread.conversation_id)}
                        onChange={() => bulkActions.selectConversation(conversation.thread.conversation_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap w-1/4"
                      onClick={() => handleRowClick(conversation.thread.conversation_id)}
                    >
                      <div>
                        <div className="text-base font-medium text-gray-900">
                          {conversation.thread.lead_name || 'Unknown Lead'}
                        </div>
                        {conversation.thread.location && (
                          <div className="text-sm text-gray-500">{conversation.thread.location}</div>
                        )}
                      </div>
                    </td>
                    <td 
                      className="px-3 py-4 whitespace-nowrap w-1/5 text-left align-middle"
                      onClick={() => handleRowClick(conversation.thread.conversation_id)}
                    >
                      <div className="text-base text-gray-900">
                        {conversation.thread.client_email || 'No email'}
                      </div>
                    </td>
                    <td 
                      className="px-3 py-4 whitespace-nowrap w-1/6 text-left align-middle"
                      onClick={() => handleRowClick(conversation.thread.conversation_id)}
                    >
                      <div className="text-base text-gray-900">
                        {conversation.lastActivity}
                      </div>
                    </td>
                    <td 
                      className="px-3 py-4 whitespace-nowrap w-1/6 text-left align-middle"
                      onClick={() => handleRowClick(conversation.thread.conversation_id)}
                    >
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 text-base font-semibold rounded-full border justify-center",
                        getStatusColor(conversation.status)
                      )}>
                        {getStatusIcon(conversation.status)}
                        <span className="ml-1">{conversation.status}</span>
                      </span>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap w-1/6"
                      onClick={e => { e.stopPropagation(); if (!showEVModal) handleRowClick(conversation.thread.conversation_id); }}
                    >
                      {conversation.evScore !== null ? (
                        <>
                          <button
                            className={cn(
                              "inline-flex px-2 py-1 text-xs font-semibold rounded-full border items-center gap-1 focus:outline-none",
                              getEVScoreColor(conversation.evScore)
                            )}
                            onClick={e => { e.stopPropagation(); setShowEVModal(true); setModalScore(conversation.evScore); }}
                            aria-label="Show EV Score info"
                            type="button"
                          >
                            <Info className="w-4 h-4 mr-1" />
                            {conversation.evScore}
                          </button>
                          <EVScoreInfoModal 
                            isOpen={showEVModal} 
                            onClose={() => setShowEVModal(false)} 
                            score={modalScore ?? undefined} 
                            modalId={`ev-modal-table-${conversation.thread.conversation_id}`}
                          />
                        </>
                      ) : (
                        <span className="text-base text-gray-400">N/A</span>
                      )}
                    </td>
                    <td 
                      className="px-3 py-4 whitespace-nowrap text-base text-gray-900 w-1/12 text-left align-middle"
                      onClick={() => handleRowClick(conversation.thread.conversation_id)}
                    >
                      {conversation.messages.length}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-1 border-t border-gray-200 flex-shrink-0">{/* py-1 instead of py-3 for reduced height */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {sortedConversations.length} of {conversations.length} conversations</span>
          {loading && <span>Refreshing...</span>}
        </div>
      </div>

      {/* Add custom scrollbar styles at the bottom of the file */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}