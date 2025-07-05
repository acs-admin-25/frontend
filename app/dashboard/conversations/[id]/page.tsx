/**
 * File: app/dashboard/conversations/[id]/page.tsx
 * Purpose: Renders a detailed conversation view with message history, client information, and AI-powered insights.
 * Author: Alejo Cagliolo
 * Date: 5/25/25
 * Version: 5.0.0 - Google Docs Style Layout with Single Column Widget System
 */

"use client"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

// Import components
import {
  LoadingSkeleton,
  MessageList,
  CompletionModal,
  ReportModal,
  GenerateModal,
  EmailPreviewModal,
  FlaggedNotificationModal,
  WidgetToolboxModal,
  MessageToolbar,
  AIToolbar,
  FloatingWidget
} from "./components"

// Import widget system
import { useWidgetLayout } from "@/lib/hooks/useWidgetLayout"
import { SingleColumnWidgetLayout } from "@/app/dashboard/components/layout/SingleColumnWidgetLayout"


// Import hooks and utilities
import { useConversationDetail } from "./hooks/useConversationDetail"
import { useConversationActions } from "./hooks/useConversationActions"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import Logo from "@/components/ui/Logo"
import { WidgetActions, WidgetState } from "@/lib/types/widgets"
import { cn } from "@/lib/utils/utils"

export default function ConversationDetailPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const conversationDetail = useConversationDetail();
  const {
    isLoading, conversation,
    messageInput, generatedResponse, isResponseFlagged, generatingResponse,
    sendingEmail, userSignature, userResponseEmail, notes, copySuccess,
    generatingPdf, feedback, evFeedback, updatingFeedbackId,
    updatingEvFeedbackId, updatingOverride, unflagging, clearingFlag,
    completingConversation, updatingSpam, reportingResponse, reportMessageId,
    showGenerateModal, showEmailPreviewModal, showFlaggedNotification,
    showCompletionModal, showReportModal, columnState,
    setMessageInput, setGeneratedResponse, setIsResponseFlagged,
    setGeneratingResponse, setSendingEmail, setNotes, setCopySuccess,
    setGeneratingPdf, setFeedback, setEvFeedback,
    setUpdatingFeedbackId, setUpdatingEvFeedbackId,
    setUpdatingOverride, setUnflagging, setClearingFlag,
    setCompletingConversation, setUpdatingSpam, setReportingResponse,
    setReportMessageId, setShowGenerateModal, setShowEmailPreviewModal,
    setShowFlaggedNotification, setShowCompletionModal, setShowReportModal,
    toggleLeftColumn, toggleRightColumn,
    isToolboxOpen, setIsToolboxOpen
  } = conversationDetail;

  // Widget layout management
  const {
    widgets,
    isLoading: widgetsLoading,
    addWidget,
    removeWidget,
    reorderWidgets,
    reorderColumnWidgets,
    clearAllWidgets,
    moveWidget,
    updateWidgetPosition: updateFloatingWidgetPosition,
    toggleWidgetVisibility,
    makeWidgetFloat,
    returnWidgetToColumn
  } = useWidgetLayout();

  // Custom hooks
  const conversationActions = useConversationActions();

  // Action handlers
  const handleReportSubmit = (reason: string, details: string) => {
    conversationActions.handleReportSubmit(reason, details, reportMessageId);
    setShowReportModal(false);
  };

  const handleCloseGenerateModal = () => {
    conversationActions.handleCloseGenerateModal(setShowGenerateModal, setGeneratedResponse, setIsResponseFlagged);
  };

  const handleUseGeneratedResponse = () => {
    conversationActions.handleUseGeneratedResponse(generatedResponse, setMessageInput, setShowGenerateModal);
  };

  const handleGenerateAIResponse = () => {
    conversationActions.generateAIResponse(setGeneratingResponse);
  };

  const handleSendEmail = () => {
    conversationActions.sendEmail(setSendingEmail, setShowEmailPreviewModal);
  };

  const handleFocusOverrideButton = () => {
    conversationActions.handleFocusOverrideButton(setShowFlaggedNotification);
  };

  const handleCompleteConversation = (reason: string, nextSteps: string) => {
    conversationActions.handleCompleteConversation(reason, nextSteps, setCompletingConversation, setShowCompletionModal);
  };

  const handleUnflag = () => {
    conversationActions.handleUnflag(setUnflagging);
  };

  const saveNotes = (newNotes: string) => {
    conversationActions.saveNotes(newNotes, setNotes);
  };

  const handleCopyConversation = () => {
    const messages = conversation?.messages || [];
    const clientEmail = conversation?.thread?.client_email || '';
    conversationActions.handleCopyConversation(messages, clientEmail, setCopySuccess);
  };

  const handleGeneratePDF = () => {
    conversationActions.generatePDF(setGeneratingPdf);
  };

  const handleOpenEmailPreview = () => {
    conversationActions.handleOpenEmailPreview(setShowEmailPreviewModal);
  };

  const handleEvFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    conversationActions.handleEvFeedback(messageId, feedback, setEvFeedback, setUpdatingEvFeedbackId);
  };

  const handleResponseFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    conversationActions.handleResponseFeedback(messageId, feedback, setFeedback, setUpdatingFeedbackId);
  };

  const handleOverride = () => {
    conversationActions.handleOverride(setUpdatingOverride);
  };

  const handleMarkAsNotSpam = () => {
    conversationActions.handleMarkAsNotSpam(setUpdatingSpam);
  };

  const handleClearFlag = () => {
    conversationActions.handleClearFlag(setClearingFlag);
  };

  const handleOpenCompletionModal = () => {
    conversationActions.handleOpenCompletionModal(setShowCompletionModal);
  };

  const handleReport = (messageId: string) => {
    setReportMessageId(messageId);
    setShowReportModal(true);
  };

  // Contact card actions
  const handleCall = () => {
    const phone = conversation?.thread?.phone;
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    }
  };

  const handleEmail = () => {
    const clientEmail = conversation?.thread?.client_email;
    if (clientEmail) {
      window.open(`mailto:${clientEmail}`, '_blank');
    }
  };

  const handleAddNote = () => {
    // Focus on notes widget or open a quick note modal
    const notesTextarea = document.querySelector('textarea[placeholder*="notes"]') as HTMLTextAreaElement;
    if (notesTextarea) {
      notesTextarea.focus();
    }
  };

  // Keyboard shortcuts handlers
  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
  };

  const handleJumpToUnread = () => {
    const messages = conversation?.messages || [];
    const unreadMessages = messages.filter((msg) => !msg.read);
    if (unreadMessages.length > 0) {
      const lastUnread = unreadMessages[unreadMessages.length - 1];
      const element = document.getElementById(`message-${lastUnread.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const { showKeyboardShortcuts } = useKeyboardShortcuts({
    onToggleLeftPanel: toggleLeftColumn,
    onToggleRightPanel: toggleRightColumn,
    onSendMessage: handleOpenEmailPreview,
    onGenerateResponse: handleGenerateAIResponse,
    onSearch: handleFocusSearch,
    onJumpToUnread: handleJumpToUnread
  });

  // Extract data for modals
  const leadName = conversation?.thread?.lead_name || 'Unknown Lead';
  const clientEmail = conversation?.thread?.client_email || '';
  const emailSubject = conversation?.thread?.subject || '';
  const isBusy = conversation?.thread?.busy || false;

  // Widget actions and state
  const widgetActions: WidgetActions = {
    onCall: handleCall,
    onEmail: handleEmail,
    onAddNote: handleAddNote,
    onUnflag: handleUnflag,
    onComplete: handleOpenCompletionModal,
    onClearFlag: handleClearFlag,
    onMarkAsNotSpam: handleMarkAsNotSpam,
    onGenerateResponse: handleGenerateAIResponse,
    onSendEmail: handleOpenEmailPreview,
    onOverride: handleOverride,
    onReport: handleReport,
    onFeedback: handleResponseFeedback,
    onEvFeedback: handleEvFeedback
  };

  const widgetState: WidgetState = {
    updating: false,
    unflagging,
    clearingFlag,
    completingConversation,
    updatingSpam,
    reportingResponse,
    generatingResponse,
    sendingEmail,
    updatingOverride,
    updatingFeedbackId,
    updatingEvFeedbackId
  };

  // Handle making widget float
  const handleMakeWidgetFloat = (widgetId: string, position: { x: number; y: number }) => {
    makeWidgetFloat(widgetId, position);
  };

  // Handle floating widget drag end
  const handleFloatingWidgetDragEnd = (widgetId: string, position: { x: number; y: number }) => {
    updateFloatingWidgetPosition(widgetId, position);
  };

  // Handle closing floating widget
  const handleCloseFloatingWidget = (widgetId: string) => {
    returnWidgetToColumn(widgetId);
  };

  if (isLoading || widgetsLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col h-full max-h-full bg-muted/30" data-dashboard-layout>
      {/* Modals */}
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={reportingResponse}
        modalId={`report-modal-${conversation?.thread.conversation_id}`}
      />
      <GenerateModal
        isOpen={showGenerateModal}
        onClose={handleCloseGenerateModal}
        generatedResponse={generatedResponse}
        onUseResponse={handleUseGeneratedResponse}
        onRegenerate={handleGenerateAIResponse}
        isRegenerating={generatingResponse}
        isFlagged={isResponseFlagged}
        modalId={`generate-modal-${conversation?.thread.conversation_id}`}
      />
      <EmailPreviewModal
        isOpen={showEmailPreviewModal}
        onClose={() => setShowEmailPreviewModal(false)}
        onSend={handleSendEmail}
        subject={emailSubject}
        body={messageInput}
        signature={userSignature}
        recipientEmail={clientEmail}
        recipientName={leadName}
        isSending={sendingEmail}
        session={session}
        responseEmail={userResponseEmail}
        modalId={`email-preview-modal-${conversation?.thread.conversation_id}`}
      />
      <FlaggedNotificationModal
        isOpen={showFlaggedNotification}
        onClose={() => setShowFlaggedNotification(false)}
        onFocusOverrideButton={handleFocusOverrideButton}
        modalId={`flagged-notification-modal-${conversation?.thread.conversation_id}`}
      />
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={handleCompleteConversation}
        isSubmitting={completingConversation}
        leadName={leadName}
        clientEmail={clientEmail}
        modalId={`completion-modal-${conversation?.thread.conversation_id}`}
      />

      {/* Floating Widgets */}
      {widgets.filter(w => w.isFloating && w.isVisible).map(widget => (
        <FloatingWidget
          key={widget.id}
          widget={widget}
          conversation={conversation || null}
          actions={widgetActions}
          state={widgetState}
          onClose={() => handleCloseFloatingWidget(widget.id)}
          onDragEnd={(position) => handleFloatingWidgetDragEnd(widget.id, position)}
          onSnapToColumn={() => handleCloseFloatingWidget(widget.id)}
        />
      ))}

      {/* Fixed Header - Google Docs Style */}
      <header className="flex-shrink-0 bg-card border-b border-border shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center gap-2 lg:gap-4">
            <Logo size="md" variant="icon-only" />
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base lg:text-lg font-medium text-foreground truncate">Conversation Detail</h1>
              <p className="text-xs lg:text-sm text-muted-foreground truncate">with {leadName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={showKeyboardShortcuts}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Keyboard shortcuts (Ctrl + ?)"
              >
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Google Docs Style */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0 overflow-hidden p-4 lg:p-6">
        {/* Left Sidebar - Single Column Widget System */}
        <div className="w-full lg:w-1/3 lg:min-w-[320px] lg:max-w-[400px] flex flex-col order-2 lg:order-1">
          <div className="flex-1 min-h-0">
            <SingleColumnWidgetLayout
              widgets={widgets.filter(w => w.isVisible)}
              conversation={conversation || null}
              actions={widgetActions}
              state={widgetState}
              onAddWidget={() => setIsToolboxOpen(true)}
              onRemoveWidget={removeWidget}
              onMoveWidget={moveWidget}
              onReorderColumnWidgets={reorderColumnWidgets}
              onMakeWidgetFloat={handleMakeWidgetFloat}
              className="h-full"
            />
          </div>
        </div>

        {/* Column Boundary Indicator - Only visible when dragging */}
        <div 
          className={cn(
            "fixed top-0 w-1 bg-primary/20 pointer-events-none transition-opacity duration-300 z-40",
            "lg:left-[33.333%] md:left-[40%] left-[50%]",
            widgets.some(w => w.isFloating) ? "opacity-30" : "opacity-0"
          )}
          style={{ height: '100vh' }}
        />

        {/* Center Chat Area - Google Docs Style */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-card border-2 border-border/60 rounded-xl shadow-lg overflow-hidden order-1 lg:order-2">
          {/* Message Toolbar */}
          <MessageToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onJumpToUnread={handleJumpToUnread}
            onShowKeyboardShortcuts={showKeyboardShortcuts}
            widgets={widgets}
            onAddWidget={() => setIsToolboxOpen(true)}
            onRemoveWidget={removeWidget}
            onToggleWidgetVisibility={toggleWidgetVisibility}
            searchInputRef={searchInputRef}
          />

          {/* Message List */}
          <div className="flex-1 min-h-0">
            <MessageList
              conversation={conversation || null}
              feedback={feedback}
              evFeedback={evFeedback}
              updatingFeedbackId={updatingFeedbackId}
              updatingEvFeedbackId={updatingEvFeedbackId}
              onResponseFeedback={handleResponseFeedback}
              onEvFeedback={handleEvFeedback}
              onReport={handleReport}
              searchInputRef={searchInputRef}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onJumpToUnread={handleJumpToUnread}
            />
          </div>

          {/* AI Toolbar */}
          <AIToolbar
            onGenerateResponse={handleGenerateAIResponse}
            onSendEmail={handleOpenEmailPreview}
            onOpenGenerateModal={() => setShowGenerateModal(true)}
            generatingResponse={generatingResponse}
            isBusy={isBusy}
            isFlagged={isResponseFlagged}
            overrideEnabled={false}
            onOverrideToggle={handleOverride}
            updatingOverride={updatingOverride}
          />
        </div>
      </div>

      {/* Widget Toolbox Modal */}
      {isToolboxOpen && (
        <WidgetToolboxModal
          isOpen={isToolboxOpen}
          onClose={() => setIsToolboxOpen(false)}
          currentWidgets={widgets}
          onAddWidget={addWidget}
          modalId={`widget-toolbox-modal-${conversation?.thread.conversation_id}`}
        />
      )}
    </div>
  );
}

/**
 * Change Log:
 * 5/25/25 - Initial version
 * - Created conversation detail page with message history
 * - Implemented client information panel
 * - Added AI-powered conversation summary
 * - Integrated quick action buttons
 * - Added responsive design for all screen sizes
 * 
 * 5/25/25 - Version 3.0.0 - Modular Architecture
 * - Broke down monolithic component into smaller, focused components
 * - Created custom hooks for state management and actions
 * - Separated utility functions and styles
 * - Improved maintainability and code organization
 * - Added proper TypeScript types and interfaces
 * 
 * 5/25/25 - Version 4.0.0 - Enhanced Layout
 * - Implemented resizable sidebars with drag-to-resize functionality
 * - Enhanced contact card with avatar and action buttons
 * - Improved AI insights with collapsible sections
 * - Added rich text editor with formatting toolbar
 * - Implemented message list with date separators and search
 * - Added floating "new messages" button
 * - Enhanced responsive design and accessibility
 * - Improved visual hierarchy and user experience
 * - Added keyboard shortcuts and help system
 * 
 * 5/25/25 - Version 4.1.0 - Fixed Layout Conflicts
 * - Removed min-h-screen to prevent conflicts with dashboard layout
 * - Changed to h-full to work within dashboard container
 * - Added overflow-hidden to main content area
 * - Fixed header to use flex-shrink-0 instead of sticky
 * - Ensured proper height distribution within dashboard layout
 * - Eliminated black components and layout shifting issues
 * 
 * 5/25/25 - Version 4.2.0 - Canonical Conversation Type
 * - Updated components to accept entire conversation object
 * - Removed individual property passing in favor of conversation object
 * - Improved type safety and consistency across components
 * - Enhanced maintainability by centralizing conversation data access
 * 
 * 5/25/25 - Version 4.3.0 - Simplified Conversation Usage
 * - Removed redundant data extraction from useConversationDetail hook
 * - Components now extract data directly from conversation object
 * - Simplified prop passing and reduced code duplication
 * - Improved maintainability by centralizing data access in components
 * 
 * 5/25/25 - Version 4.4.0 - Google Docs Styling with ACS Theme
 * - Fixed TypeScript errors by properly typing conversation as null when undefined
 * - Updated to use ACS theme colors throughout the page
 * - Implemented Google Docs-like styling with clean, minimal design
 * - Removed gradient background in favor of clean card-based layout
 * - Added proper border separators between panels
 * - Enhanced visual hierarchy with consistent spacing and typography
 * - Improved accessibility with proper contrast ratios
 * 
 * 5/25/25 - Version 4.5.0 - Widget System Integration
 * - Integrated new widget system for left sidebar
 * - Replaced hardcoded components with dynamic widget layout
 * - Added widget toolbox for adding/removing widgets
 * - Implemented widget persistence with localStorage
 * - Added ACS theme compliance to all widget components
 * - Created modular widget architecture with proper sizing
 * - Enhanced user experience with customizable widget layout
 * 
 * 5/25/25 - Version 5.0.0 - Google Docs Style Layout with Single Column Widget System
 * - Implemented Google Docs-style layout with message list as the main document
 * - Created single column widget system with 4 rows and 1 column grid
 * - Added widget conflict detection with red highlighting for occupied widgets
 * - Moved AI response section to bottom of conversation area
 * - Created MessageToolbar component for widget controls at top of message list
 * - Implemented 2/3 - 1/3 layout split (message list takes 2/3, widgets take 1/3)
 * - Added warning color to theme system for widget conflicts
 * - Enhanced widget snapping with conflict resolution
 * - Improved overall user experience with Google Docs-style interface
 * 
 * 5/25/25 - Version 5.1.0 - AI Toolbar Redesign
 * - Replaced bulky AI response section with clean, icon-based toolbar
 * - Created AIToolbar component with aesthetic ACS theme compliance
 * - Added hover tooltips for all toolbar actions
 * - Implemented smooth animations and micro-interactions
 * - Added status indicators for flagged responses and override settings
 * - Decluttered message list area for better focus on conversation
 * - Enhanced user experience with intuitive icon-based interface
 * - Maintained all AI functionality through modal-based interactions
 * 
 * 5/25/25 - Version 5.2.0 - Responsive Layout and Height Matching
 * - Fixed left column height to match right message column height
 * - Implemented responsive grid layout that adapts to different screen sizes
 * - Added mobile-first responsive design with proper breakpoints
 * - Enhanced widget grid with dynamic cell sizing based on screen width
 * - Added window resize listener for real-time responsive updates
 * - Improved layout on mobile devices with stacked column layout
 * - Enhanced header responsiveness with proper text truncation
 * - Optimized spacing and padding for different screen sizes
 * - Ensured consistent height distribution across all screen sizes
 * - Added proper flex layout to prevent height mismatches
 */
