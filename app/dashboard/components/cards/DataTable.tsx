/**
 * File: components/features/dashboard/DataTable.tsx
 * Purpose: Modular data table component for displaying conversations/leads across dashboard sections
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.0.0
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ChevronUp, 
  ChevronDown, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { getStatusColor, getPriorityColor, formatDuration } from '@/lib/utils/dashboard';
import type { Conversation } from '@/types/conversation';

interface DataTableProps {
  conversations: Conversation[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  showFilters?: boolean;
  showSearch?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

interface SortConfig {
  key: keyof Conversation['thread'] | 'lastMessage';
  direction: 'asc' | 'desc';
}

export function DataTable({
  conversations,
  loading = false,
  error = null,
  onRefresh,
  showFilters = true,
  showSearch = true,
  title = 'Conversations',
  emptyMessage = 'No conversations found',
  className
}: DataTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastMessageAt', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter conversations based on search and status
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        (conv.thread.lead_name || '').toLowerCase().includes(query) ||
        (conv.thread.client_email || '').toLowerCase().includes(query) ||
        (conv.thread.location || '').toLowerCase().includes(query) ||
        conv.messages.some(msg => 
          msg.body.toLowerCase().includes(query) ||
          (msg.subject || '').toLowerCase().includes(query)
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'active':
          filtered = filtered.filter(conv => !conv.thread.completed);
          break;
        case 'completed':
          filtered = filtered.filter(conv => conv.thread.completed);
          break;
        case 'flagged':
          filtered = filtered.filter(conv => conv.thread.flag || conv.thread.flag_for_review);
          break;
        case 'spam':
          filtered = filtered.filter(conv => conv.thread.spam);
          break;
      }
    }

    return filtered;
  }, [conversations, searchQuery, statusFilter]);

  // Sort conversations
  const sortedConversations = useMemo(() => {
    const sorted = [...filteredConversations];
    
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortConfig.key === 'lastMessage') {
        aValue = new Date(a.thread.lastMessageAt).getTime();
        bValue = new Date(b.thread.lastMessageAt).getTime();
      } else {
        aValue = a.thread[sortConfig.key];
        bValue = b.thread[sortConfig.key];
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredConversations, sortConfig]);

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowClick = (conversationId: string) => {
    if (conversationId) {
      router.push(`/dashboard/conversations/${conversationId}`);
    }
  };

  const getStatusText = (conversation: Conversation) => {
    if (conversation.thread.spam) return 'Spam';
    if (conversation.thread.flag || conversation.thread.flag_for_review) return 'Flagged';
    if (conversation.thread.completed) return 'Completed';
    return 'Active';
  };

  const getLastMessageTime = (conversation: Conversation) => {
    const lastMessage = conversation.messages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (!lastMessage) return 'No messages';
    
    const date = new Date(lastMessage.timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return format(date, 'MMM d, yyyy');
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
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {(showSearch || showFilters) && (
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {showFilters && (
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="flagged">Flagged</option>
                  <option value="spam">Spam</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table Container - Takes remaining height */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Table Header - Fixed */}
        <div className="flex-shrink-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('lead_name')}>
                  <div className="flex items-center space-x-1">
                    <span>Lead</span>
                    {sortConfig.key === 'lead_name' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('client_email')}>
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {sortConfig.key === 'client_email' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('lastMessage')}>
                  <div className="flex items-center space-x-1">
                    <span>Last Message</span>
                    {sortConfig.key === 'lastMessage' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading conversations...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedConversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedConversations.map((conversation) => (
                  <tr
                    key={conversation.thread.conversation_id}
                    onClick={() => {
                      const id = conversation.thread.conversation_id;
                      if (id) handleRowClick(id);
                    }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {conversation.thread.lead_name || 'Unknown Lead'}
                        </div>
                        {conversation.thread.location && (
                          <div className="text-sm text-gray-500">{conversation.thread.location}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {conversation.thread.client_email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getLastMessageTime(conversation)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        getStatusColor(getStatusText(conversation))
                      )}>
                        {getStatusText(conversation)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        getPriorityColor(conversation.thread.priority || 'low')
                      )}>
                        {conversation.thread.priority || 'low'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
      <div className="px-6 py-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {sortedConversations.length} of {conversations.length} conversations</span>
          {loading && <span>Refreshing...</span>}
        </div>
      </div>
    </div>
  );
} 