import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import { useConversations } from "../../../lib/conversations-context"
import type { Conversation } from "@/lib/types/conversation"

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

  // Use the conversations context
  const { 
    conversations, 
    isLoading: conversationsLoading, 
    error: conversationError,
    refreshConversations
  } = useConversations();

  // Get the specific conversation from the context
  const conversation = conversations.find((conv: Conversation) => conv.thread.conversation_id === conversationId);

  // Loading state should be true if conversations are loading OR if we have conversations but no matching conversation
  const isLoading = conversationsLoading || (!conversationsLoading && conversations.length > 0 && !conversation);

  // Log for debugging
  useEffect(() => {
    console.log('[useConversationDetail] Conversation lookup:', {
      conversationId,
      conversationsLength: conversations.length,
      foundConversation: !!conversation,
      conversationIds: conversations.map((c: Conversation) => c.thread.conversation_id).slice(0, 5),
      isLoading
    });
  }, [conversationId, conversations, conversation, isLoading]);

  // If we have conversations but no matching conversation, try to refresh
  useEffect(() => {
    if (!conversationsLoading && conversations.length > 0 && !conversation && conversationId) {
      console.log('[useConversationDetail] Conversation not found, refreshing...');
      refreshConversations();
    }
  }, [conversationsLoading, conversations.length, conversation, conversationId, refreshConversations]);

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

  // Load user signature and email from database
  useEffect(() => {
    const loadUserSignature = async () => {
      if (!session?.user?.id) {
        console.log('🔍 [Signature] No session user ID available');
        return;
      }
      
      console.log('🔍 [Signature] Fetching signature for user ID:', session.user.id);
      console.log('🔍 [Signature] Session data:', {
        userId: session.user.id,
        userEmail: session.user.email
      });
      
      try {
        // Fetch user data from database
        const requestBody = {
          table_name: 'Users',
          index_name: 'id-index',
          key_name: 'id',
          key_value: session.user.id
        };
        
        console.log('🔍 [Signature] Database request:', requestBody);
        
        const response = await fetch('/api/db/select', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('🔍 [Signature] Database response status:', response.status);
        console.log('🔍 [Signature] Database response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [Signature] Database response data:', data);
          
          if (data.success && data.items && data.items.length > 0) {
            const userData = data.items[0];
            console.log('🔍 [Signature] User data found:', {
              id: userData.id,
              email: userData.email,
              hasSignature: !!userData.email_signature,
              signatureLength: userData.email_signature?.length || 0,
              signatureField: userData.email_signature,
              allFields: Object.keys(userData)
            });
            
            const signature = userData.email_signature || 'Best regards,\n[Your Name]\nReal Estate Agent';
            const email = userData.email || session.user.email || 'agent@example.com';
            
            setUserSignature(signature);
            setUserResponseEmail(email);
            
            console.log('✅ [Signature] Signature loaded successfully:', {
              signature: signature.substring(0, 100) + '...',
              email,
              finalSignatureLength: signature.length
            });
          } else {
            console.log('⚠️ [Signature] No user data found in response');
            console.log('⚠️ [Signature] Response structure:', {
              success: data.success,
              hasItems: !!data.items,
              itemsLength: data.items?.length || 0,
              itemsKeys: data.items ? Object.keys(data.items) : null
            });
            // Fallback to default values
            setUserSignature('Best regards,\n[Your Name]\nReal Estate Agent');
            setUserResponseEmail(session.user.email || 'agent@example.com');
          }
        } else {
          console.error('❌ [Signature] Failed to fetch user signature:', response.statusText);
          const errorText = await response.text();
          console.error('❌ [Signature] Error response body:', errorText);
          // Fallback to default values
          setUserSignature('Best regards,\n[Your Name]\nReal Estate Agent');
          setUserResponseEmail(session.user.email || 'agent@example.com');
        }
      } catch (error) {
        console.error('❌ [Signature] Error fetching user signature:', error);
        // Fallback to default values
        setUserSignature('Best regards,\n[Your Name]\nReal Estate Agent');
        setUserResponseEmail(session.user.email || 'agent@example.com');
      }
    };
    
    if (session?.user) {
      loadUserSignature();
    }
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