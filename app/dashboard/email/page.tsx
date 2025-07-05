/**
 * File: app/dashboard/email/page.tsx
 * Purpose: Email inbox interface with centralized data processing and modular components
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 3.0.0
 */

"use client"

import React, { Suspense, useState } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { useEmailData } from '@/lib/hooks/useCentralizedDashboardData';
import { ArrowLeft, Mail, Inbox, Send, Archive, Trash2, Star, Search, Filter, RefreshCw, MoreVertical } from "lucide-react";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

function EmailContent() {
  const router = useRouter();
  const { 
    data,
    conversations, 
    loading, 
    error, 
    refetch 
  } = useEmailData();

  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading email inbox..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Email Inbox</h2>
          <p className="text-gray-600 mb-4">{error || 'An unexpected error occurred.'}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter conversations based on search and folder
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      (conv.thread.lead_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.thread.client_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => 
        msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFolder = selectedFolder === 'inbox' || 
      (selectedFolder === 'sent' && conv.messages.some(msg => msg.type === 'outbound-email')) ||
      (selectedFolder === 'archived' && conv.thread.completed) ||
      (selectedFolder === 'trash' && conv.thread.spam);

    return matchesSearch && matchesFolder;
  });

  const handleEmailClick = (conversationId: string) => {
    router.push(`/dashboard/conversations/${conversationId}`);
  };

  const handleEmailSelect = (conversationId: string) => {
    setSelectedEmails(prev => 
      prev.includes(conversationId) 
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const getLastMessage = (conversation: any) => {
    return conversation.messages
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const getEmailPreview = (conversation: any) => {
    const lastMessage = getLastMessage(conversation);
    if (!lastMessage) return 'No messages';
    
    const preview = lastMessage.body.replace(/<[^>]*>/g, '').trim();
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return format(date, 'MMM d');
  };

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: conversations.filter(c => !c.thread.completed && !c.thread.spam).length },
    { id: 'sent', name: 'Sent', icon: Send, count: conversations.filter(c => c.messages.some(m => m.type === 'outbound-email')).length },
    { id: 'archived', name: 'Archived', icon: Archive, count: conversations.filter(c => c.thread.completed).length },
    { id: 'trash', name: 'Trash', icon: Trash2, count: conversations.filter(c => c.thread.spam).length },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Email Inbox</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={loading ? "w-5 h-5 animate-spin" : "w-5 h-5"} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <div className="p-4">
            <nav className="space-y-1">
              {folders.map((folder) => {
                const Icon = folder.icon;
                const isActive = selectedFolder === folder.id;
                
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{folder.name}</span>
                    </div>
                    {folder.count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {folder.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Email List Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {selectedFolder}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredConversations.length} emails
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms' : `No emails in ${selectedFolder}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => {
                  const lastMessage = getLastMessage(conversation);
                  const isSelected = selectedEmails.includes(conversation.thread.conversation_id);
                  const isUnread = !conversation.thread.read;
                  
                  return (
                    <div
                      key={conversation.thread.conversation_id}
                      className={`flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleEmailClick(conversation.thread.conversation_id)}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleEmailSelect(conversation.thread.conversation_id);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      {/* Star */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                      
                      {/* Email Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium truncate ${
                              isUnread ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {conversation.thread.lead_name || conversation.thread.client_email}
                            </span>
                            {isUnread && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 flex-shrink-0">
                            {lastMessage ? getTimeAgo(lastMessage.timestamp) : ''}
                          </span>
                        </div>
                        
                        <div className="mt-1">
                          <p className={`text-sm truncate ${
                            isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
                          }`}>
                            {lastMessage?.subject || 'No subject'}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {getEmailPreview(conversation)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailPage() {
  return (
    <div className="h-full w-full">
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Email Inbox Error</h2>
            <p className="text-gray-600 mb-4">Something went wrong with the email inbox.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }>
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading email inbox..." />}>
          <EmailContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

/**
 * Change Log:
 * 12/19/24 - Version 3.0.0 - Email Inbox Interface
 * - Transformed into a proper email inbox interface
 * - Removed stats widgets and metrics cards
 * - Added sidebar with email folders (Inbox, Sent, Archived, Trash)
 * - Implemented email list with proper email styling
 * - Added search functionality and email filtering
 * - Included email selection, star, and unread indicators
 * - Enhanced user experience with hover states and transitions
 * - Maintained centralized data processing and error handling
 * 
 * 12/19/24 - Version 2.1.0 - Full Layout Integration
 * - Updated to use full width and height layout
 * - Fixed data structure issues by using correct metrics properties
 * - Integrated with centralized dashboard data processing
 * - Improved layout with proper flex structure for full height
 * - Enhanced DataTable integration with proper height constraints
 * - Applied consistent error handling and loading states
 * 
 * 12/19/24 - Version 2.0.0 - Centralized Architecture
 * - Updated to use centralized data processing with useEmailData
 * - Integrated modular components (DataTable, MetricsCard)
 * - Added consistent error handling and loading states
 * - Applied CAS theme colors and styling patterns
 * - Improved layout with proper metrics and statistics sections
 * - Enhanced user experience with better visual hierarchy
 * 
 * 5/25/25 - Version 1.0.0
 * - Created email management dashboard with inbox functionality
 * - Implemented email composition and tracking features
 * - Added email templates and performance metrics
 */
