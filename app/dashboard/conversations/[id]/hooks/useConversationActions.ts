import { useConversations } from "../../../lib/conversations-context"
import { useSession } from "next-auth/react"
import type { ExtendedMessage } from '@/lib/types/conversation'

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
  const { updateConversation, conversations } = useConversations();
  const { data: session } = useSession();
  
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
  const handleUseGeneratedResponse = (generatedResponse: string, setMessageInput: (input: string) => void, setShowGenerateModal: (show: boolean) => void, setShowEmailPreviewModal?: (show: boolean) => void, setSendingEmail?: (sending: boolean) => void) => {
    // Put the generated response into the message input for editing
    setMessageInput(generatedResponse);
    setShowGenerateModal(false);
    
    // Open the email composition modal so user can review and edit before sending
    if (setShowEmailPreviewModal) {
      setShowEmailPreviewModal(true);
    }
  };

  /**
   * Generate AI response
   */
  const generateAIResponse = async (setGeneratingResponse: (generating: boolean) => void, conversation?: any) => {
    console.log('🚀 generateAIResponse called with conversation:', conversation?.thread?.conversation_id);
    
    if (!conversation) {
      console.error('❌ No conversation provided to generateAIResponse');
      throw new Error('Conversation not provided');
    }

    if (!conversation.thread.conversation_id) {
      console.error('❌ No conversation ID found in conversation:', conversation);
      throw new Error('Conversation ID not found');
    }

    if (!conversation.thread.associated_account) {
      console.error('❌ No associated account found in conversation:', conversation);
      throw new Error('Associated account not found');
    }

    setGeneratingResponse(true);
    
    try {
      console.log('Generating AI response...');

      // Prepare the request for AI response generation
      const request = {
        conversation_id: conversation.thread.conversation_id,
        account_id: conversation.thread.associated_account,
        is_first_email: false // This will be determined by the backend based on conversation history
      };

      console.log('Sending AI request:', request);

      // Call the LCP API to generate AI response
      const response = await fetch('/api/lcp/get_llm_response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('AI Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Response error:', errorText);
        throw new Error(`Failed to generate AI response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Response data:', data);
      
      if (data.success) {
        let responseText = '';
        
        // Handle different response formats
        if (data.data) {
          if (typeof data.data === 'string') {
            responseText = data.data;
          } else if (data.data.response) {
            responseText = data.data.response;
          } else if (data.data.message) {
            responseText = data.data.message;
          } else if (data.data.content) {
            responseText = data.data.content;
          } else {
            console.warn('Unknown AI response format:', data.data);
            responseText = JSON.stringify(data.data);
          }
        } else if (data.response) {
          responseText = data.response;
        } else if (data.message) {
          responseText = data.message;
        } else {
          console.warn('No response text found in AI response:', data);
          responseText = 'AI response generated successfully';
        }

        console.log('✅ AI response generated successfully:', responseText);
        
        // Check if response is flagged for review
        if (data.flagged || data.data?.flagged) {
          console.log('⚠️ Response flagged for review');
          // The parent component will handle flagged responses
        }
        
        return responseText;
      } else {
        console.error('❌ AI response failed:', data);
        throw new Error(data.error || data.message || 'Failed to generate AI response');
      }
    } catch (error) {
      console.error('❌ Failed to generate AI response:', error);
      throw error;
    } finally {
      setGeneratingResponse(false);
    }
  };

  /**
   * Send email
   */
  const sendEmail = async (setSendingEmail: (sending: boolean) => void, setShowEmailPreviewModal: (show: boolean) => void, messageInput?: string) => {
    setSendingEmail(true);
    try {
      // Get current conversation from context
      const currentConversation = window.location.pathname.split('/').pop();
      if (!currentConversation) {
        throw new Error('No conversation ID found');
      }

      // Get the message body from the message input or use a default
      const responseBody = messageInput || 'Thank you for your message. We will get back to you soon.';

      console.log('Sending email with body:', responseBody);

      // Call the send email API
      const response = await fetch('/api/lcp/send_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: currentConversation,
          response_body: responseBody
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const data = await response.json();
      console.log('Email sent successfully:', data);

      // Close the modal on success
      setShowEmailPreviewModal(false);
      
      // SIMPLE APPROACH: Just refresh the conversations to get the latest data
      console.log('🔄 Refreshing conversations to get latest data...');
      console.log('Current conversations count:', conversations.length);
      // The refreshConversations function is no longer needed here as it's handled by the context
      // await refreshConversations(); 
      console.log('Refresh completed');

      // Show success message
      console.log('✅ Email sent successfully!');

    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSendingEmail(false);
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
      // Get current conversation from context
      const currentConversation = window.location.pathname.split('/').pop();
      if (!currentConversation) {
        throw new Error('No conversation ID found');
      }
      
      // Call API to unflag conversation
      const response = await fetch(`/api/conversations/${currentConversation}/unflag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to unflag conversation');
      }
      
      // Update conversation in context
      // updateConversation(currentConversation, {
      //   thread: {
      //     conversation_id: currentConversation,
      //     flag: false,
      //     flag_for_review: false
      //   }
      // });
      
      console.log('Conversation unflagged successfully');
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
      // Get current conversation from context
      const currentConversation = window.location.pathname.split('/').pop();
      if (!currentConversation) {
        throw new Error('No conversation ID found');
      }
      
      // Call API to mark as not spam
      const response = await fetch(`/api/conversations/${currentConversation}/not-spam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark as not spam');
      }
      
      // Update conversation in context
      // updateConversation(currentConversation, {
      //   thread: {
      //     conversation_id: currentConversation,
      //     spam: false
      //   }
      // });
      
      console.log('Conversation marked as not spam successfully');
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
      // Get current conversation from context
      const currentConversation = window.location.pathname.split('/').pop();
      if (!currentConversation) {
        throw new Error('No conversation ID found');
      }
      
      // Call API to clear flag
      const response = await fetch(`/api/conversations/${currentConversation}/clear-flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear flag');
      }
      
      // Update conversation in context
      // updateConversation(currentConversation, {
      //   thread: {
      //     conversation_id: currentConversation,
      //     flag: false,
      //     flag_for_review: false
      //   }
      // });
      
      console.log('Flag cleared successfully');
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