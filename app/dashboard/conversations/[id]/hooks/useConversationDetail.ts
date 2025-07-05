import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import { useOptimisticConversations } from "@/lib/hooks/useOptimisticConversations"
import type { Conversation } from "@/types/conversation"

// Temporary state type, will be removed.
interface ColumnState {
  left: boolean;
  right: boolean;
}

/**
 * Custom hook for managing conversation detail state and operations
 */
export function useConversationDetail() {
  const params = useParams();
  const { data: session } = useSession() as { 
    data: (Session & { user: { id: string; email?: string } }) | null; 
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const conversationId = params?.id as string;

  // Use the new optimistic conversations hook
  const { 
    conversations, 
    loading: isLoading, 
    error: conversationError
  } = useOptimisticConversations({
    autoRefresh: true,
    checkNewEmails: true
  });

  // Get the specific conversation from the optimistic system
  const conversation = conversations.find(conv => conv.thread.conversation_id === conversationId);

  // UI State
  const [messageInput, setMessageInput] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isResponseFlagged, setIsResponseFlagged] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [userSignature, setUserSignature] = useState('');
  const [userResponseEmail, setUserResponseEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike'>>({});
  const [evFeedback, setEvFeedback] = useState<Record<string, 'positive' | 'negative'>>({});
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(null);
  const [updatingEvFeedbackId, setUpdatingEvFeedbackId] = useState<string | null>(null);
  const [updatingOverride, setUpdatingOverride] = useState(false);
  const [unflagging, setUnflagging] = useState(false);
  const [clearingFlag, setClearingFlag] = useState(false);
  const [completingConversation, setCompletingConversation] = useState(false);
  const [updatingSpam, setUpdatingSpam] = useState(false);
  const [reportingResponse, setReportingResponse] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string>('');
  
  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [showFlaggedNotification, setShowFlaggedNotification] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Column visibility state
  const [columnState, setColumnState] = useState<ColumnState>({
    left: true,
    right: true
  });

  // Widget toolbox state
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Column toggle handlers
  const toggleLeftColumn = () => setColumnState((prev: ColumnState) => ({ ...prev, left: !prev.left }));
  const toggleRightColumn = () => setColumnState((prev: ColumnState) => ({ ...prev, right: !prev.right }));

  // Widget position update handler
  const updateWidgetPosition = (widgetId: string, position: { x: number; y: number }) => {
    // TODO: Implement widget position persistence
    console.log('Update widget position:', widgetId, position);
  };

  // Load user signature
  useEffect(() => {
    const loadUserSignature = async () => {
      // In a real app, this would fetch from a user settings table
      setUserSignature('Best regards,\n[Your Name]\nReal Estate Agent');
      setUserResponseEmail(session?.user?.email || 'agent@example.com');
    };
    if (session?.user) loadUserSignature();
  }, [session]);

  if (conversationError) {
    console.error("Error loading conversation:", conversationError);
  }

  return {
    // Core data
    isLoading,
    conversation,
    
    // UI State
    messageInput, setMessageInput,
    generatedResponse, setGeneratedResponse,
    isResponseFlagged, setIsResponseFlagged,
    generatingResponse, setGeneratingResponse,
    sendingEmail, setSendingEmail,
    userSignature, setUserSignature,
    userResponseEmail, setUserResponseEmail,
    notes, setNotes,
    copySuccess, setCopySuccess,
    generatingPdf, setGeneratingPdf,
    feedback, setFeedback,
    evFeedback, setEvFeedback,
    updatingFeedbackId, setUpdatingFeedbackId,
    updatingEvFeedbackId, setUpdatingEvFeedbackId,
    updatingOverride, setUpdatingOverride,
    unflagging, setUnflagging,
    clearingFlag, setClearingFlag,
    completingConversation, setCompletingConversation,
    updatingSpam, setUpdatingSpam,
    reportingResponse, setReportingResponse,
    reportMessageId, setReportMessageId,
    
    // Modal states
    showGenerateModal, setShowGenerateModal,
    showEmailPreviewModal, setShowEmailPreviewModal,
    showFlaggedNotification, setShowFlaggedNotification,
    showCompletionModal, setShowCompletionModal,
    showReportModal, setShowReportModal,

    // Column state
    columnState,
    toggleLeftColumn,
    toggleRightColumn,

    // Widget toolbox state
    isToolboxOpen, setIsToolboxOpen,
    draggedWidget, setDraggedWidget,
    updateWidgetPosition,
  };
} 