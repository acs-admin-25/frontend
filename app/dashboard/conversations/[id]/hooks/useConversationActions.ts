import { useConversations } from "../../../lib/conversations-context"
import type { ExtendedMessage } from '@/types/conversation'

/**
 * Generate conversation text for copying
 */
function generateConversationText(messages: ExtendedMessage[], clientEmail: string): string {
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  return sortedMessages.map(msg => {
    const timestamp = new Date(msg.timestamp).toLocaleString();
    const sender = msg.sender_name || msg.sender_email;
    return `[${timestamp}] ${sender}: ${msg.body}`;
  }).join('\n\n');
}

/**
 * Custom hook for managing conversation action handlers
 */
export function useConversationActions() {
  const { updateConversation } = useConversations();

  /**
   * Handle report submission
   */
  const handleReportSubmit = async (reason: string, details: string, messageId: string) => {
    try {
      // Implementation for report submission
      console.log('Report submitted:', { reason, details, messageId });
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  /**
   * Handle close generate modal
   */
  const handleCloseGenerateModal = (setShowGenerateModal: (show: boolean) => void, setGeneratedResponse: (response: string) => void, setIsResponseFlagged: (flagged: boolean) => void) => {
    setShowGenerateModal(false);
    setGeneratedResponse('');
    setIsResponseFlagged(false);
  };

  /**
   * Handle use generated response
   */
  const handleUseGeneratedResponse = (generatedResponse: string, setMessageInput: (input: string) => void, setShowGenerateModal: (show: boolean) => void) => {
    setMessageInput(generatedResponse);
    setShowGenerateModal(false);
  };

  /**
   * Generate AI response
   */
  const generateAIResponse = async (setGeneratingResponse: (generating: boolean) => void) => {
    setGeneratingResponse(true);
    try {
      // Implementation for AI response generation
      console.log('Generating AI response...');
    } catch (error) {
      console.error('Failed to generate AI response:', error);
    } finally {
      setGeneratingResponse(false);
    }
  };

  /**
   * Send email
   */
  const sendEmail = async (setSendingEmail: (sending: boolean) => void, setShowEmailPreviewModal: (show: boolean) => void) => {
    setSendingEmail(true);
    try {
      // Implementation for sending email
      console.log('Sending email...');
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSendingEmail(false);
      setShowEmailPreviewModal(false);
    }
  };

  /**
   * Handle focus override button
   */
  const handleFocusOverrideButton = (setShowFlaggedNotification: (show: boolean) => void) => {
    setShowFlaggedNotification(false);
    // Focus the override button
    const overrideButton = document.querySelector('[data-override-status]') as HTMLButtonElement;
    if (overrideButton) {
      overrideButton.focus();
    }
  };

  /**
   * Handle complete conversation
   */
  const handleCompleteConversation = async (reason: string, nextSteps: string, setCompletingConversation: (completing: boolean) => void, setShowCompletionModal: (show: boolean) => void) => {
    setCompletingConversation(true);
    try {
      // Implementation for completing conversation
      console.log('Completing conversation:', { reason, nextSteps });
    } catch (error) {
      console.error('Failed to complete conversation:', error);
    } finally {
      setCompletingConversation(false);
      setShowCompletionModal(false);
    }
  };

  /**
   * Handle unflag conversation
   */
  const handleUnflag = async (setUnflagging: (unflagging: boolean) => void) => {
    setUnflagging(true);
    try {
      // Implementation for unflagging
      console.log('Unflagging conversation...');
    } catch (error) {
      console.error('Failed to unflag conversation:', error);
    } finally {
      setUnflagging(false);
    }
  };

  /**
   * Save notes
   */
  const saveNotes = async (newNotes: string, setNotes: (notes: string) => void) => {
    try {
      // Implementation for saving notes
      console.log('Saving notes:', newNotes);
      setNotes(newNotes);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  /**
   * Handle copy conversation
   */
  const handleCopyConversation = async (sortedMessages: ExtendedMessage[], clientEmail: string, setCopySuccess: (success: boolean) => void) => {
    try {
      const conversationText = generateConversationText(sortedMessages, clientEmail);
      await navigator.clipboard.writeText(conversationText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy conversation:', error);
    }
  };

  /**
   * Generate PDF
   */
  const generatePDF = async (setGeneratingPdf: (generating: boolean) => void) => {
    setGeneratingPdf(true);
    try {
      // Implementation for PDF generation
      console.log('Generating PDF...');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  /**
   * Handle open email preview
   */
  const handleOpenEmailPreview = (setShowEmailPreviewModal: (show: boolean) => void) => {
    setShowEmailPreviewModal(true);
  };

  /**
   * Handle EV feedback
   */
  const handleEvFeedback = async (messageId: string, feedback: 'positive' | 'negative', setEvFeedback: (feedback: any) => void, setUpdatingEvFeedbackId: (id: string | null) => void) => {
    setUpdatingEvFeedbackId(messageId);
    try {
      // Implementation for EV feedback
      console.log('EV feedback:', { messageId, feedback });
      setEvFeedback((prev: any) => ({ ...prev, [messageId]: feedback }));
    } catch (error) {
      console.error('Failed to submit EV feedback:', error);
    } finally {
      setUpdatingEvFeedbackId(null);
    }
  };

  /**
   * Handle response feedback
   */
  const handleResponseFeedback = async (messageId: string, feedback: 'like' | 'dislike', setFeedback: (feedback: any) => void, setUpdatingFeedbackId: (id: string | null) => void) => {
    setUpdatingFeedbackId(messageId);
    try {
      // Implementation for response feedback
      console.log('Response feedback:', { messageId, feedback });
      setFeedback((prev: any) => ({ ...prev, [messageId]: feedback }));
    } catch (error) {
      console.error('Failed to submit response feedback:', error);
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  /**
   * Handle override toggle
   */
  const handleOverride = async (setUpdatingOverride: (updating: boolean) => void) => {
    setUpdatingOverride(true);
    try {
      // Implementation for override toggle
      console.log('Toggling override...');
    } catch (error) {
      console.error('Failed to toggle override:', error);
    } finally {
      setUpdatingOverride(false);
    }
  };

  /**
   * Handle mark as not spam
   */
  const handleMarkAsNotSpam = async (setUpdatingSpam: (updating: boolean) => void) => {
    setUpdatingSpam(true);
    try {
      // Implementation for marking as not spam
      console.log('Marking as not spam...');
    } catch (error) {
      console.error('Failed to mark as not spam:', error);
    } finally {
      setUpdatingSpam(false);
    }
  };

  /**
   * Handle clear flag
   */
  const handleClearFlag = async (setClearingFlag: (clearing: boolean) => void) => {
    setClearingFlag(true);
    try {
      // Implementation for clearing flag
      console.log('Clearing flag...');
    } catch (error) {
      console.error('Failed to clear flag:', error);
    } finally {
      setClearingFlag(false);
    }
  };

  /**
   * Handle open completion modal
   */
  const handleOpenCompletionModal = (setShowCompletionModal: (show: boolean) => void) => {
    setShowCompletionModal(true);
  };

  return {
    handleReportSubmit,
    handleCloseGenerateModal,
    handleUseGeneratedResponse,
    generateAIResponse,
    sendEmail,
    handleFocusOverrideButton,
    handleCompleteConversation,
    handleUnflag,
    saveNotes,
    handleCopyConversation,
    generatePDF,
    handleOpenEmailPreview,
    handleEvFeedback,
    handleResponseFeedback,
    handleOverride,
    handleMarkAsNotSpam,
    handleClearFlag,
    handleOpenCompletionModal,
  };
} 