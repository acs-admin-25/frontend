import { X, Send, Sparkles, RefreshCw, Check, AlertTriangle, Edit3, User, Bot } from "lucide-react"
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: EmailData) => void;
  subject: string;
  body: string;
  signature: string;
  recipientEmail: string;
  recipientName: string;
  isSending: boolean;
  session: any;
  responseEmail: string;
  modalId?: string;
  onGenerateAIResponse?: () => void;
  isGeneratingAI?: boolean;
  aiGeneratedContent?: string;
}

interface EmailData {
  subject: string;
  body: string;
  signature: string;
}

/**
 * Enhanced Email Composition Modal Component
 * Allows manual email composition with AI assistance
 */
export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend, 
  subject: initialSubject, 
  body: initialBody, 
  signature: initialSignature, 
  recipientEmail, 
  recipientName, 
  isSending, 
  session, 
  responseEmail,
  modalId = 'email-preview-modal',
  onGenerateAIResponse,
  isGeneratingAI = false,
  aiGeneratedContent = ''
}) => {
  const { activeModal, openModal, closeModal } = useModal();
  
  // Email composition state
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [signature, setSignature] = useState(initialSignature);
  const [isEditing, setIsEditing] = useState(false);
  const [showAIAssistance, setShowAIAssistance] = useState(false);
  
  // Use global modal state
  const isActuallyOpen = isOpen && activeModal === modalId;

  useEffect(() => {
    if (isOpen) {
      openModal(modalId);
      setSubject(initialSubject);
      setBody(initialBody);
      setSignature(initialSignature);
      
      // Debug logging for signature
      console.log('🔍 [EmailPreviewModal] Signature debug:', {
        initialSignature,
        signatureLength: initialSignature?.length || 0,
        hasSignature: !!initialSignature,
        signaturePreview: initialSignature?.substring(0, 100) + '...'
      });
    } else {
      closeModal(modalId);
    }
  }, [isOpen, modalId, openModal, closeModal, initialSubject, initialBody, initialSignature]);

  const handleSend = () => {
    onSend({
      subject,
      body,
      signature
    });
  };

  const handleUseAIContent = () => {
    if (aiGeneratedContent) {
      setBody(aiGeneratedContent);
      setShowAIAssistance(false);
    }
  };

  const handleGenerateAI = () => {
    if (onGenerateAIResponse) {
      onGenerateAIResponse();
      setShowAIAssistance(true);
    }
  };

  return (
    <AnimatePresence>
      {isActuallyOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
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
              className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">Email Composition</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>•</span>
                    <span>Review Check Enabled</span>
                    <span>•</span>
                    <span>Type or generate your reply</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex h-[calc(90vh-8rem)]">
                {/* Left Side - Email Composition */}
                <div className="flex-1 p-6 overflow-y-auto border-r border-border">
                  <div className="space-y-6">
                    {/* Email Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Email Details
                      </h4>
                      
                      {/* To Field */}
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">To:</label>
                        <div className="bg-muted/50 rounded-lg p-3 text-foreground">
                          {recipientName} &lt;{recipientEmail}&gt;
                        </div>
                      </div>

                      {/* From Field */}
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">From:</label>
                        <div className="bg-muted/50 rounded-lg p-3 text-foreground">
                          {session?.user?.name} &lt;{responseEmail}&gt;
                        </div>
                      </div>

                      {/* Subject Field */}
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Subject: <span className="text-xs text-muted-foreground">(Auto-generated based on conversation)</span>
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Email subject..."
                        />
                      </div>
                    </div>

                    {/* Message Composition */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          AI Response
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleGenerateAI}
                            disabled={isGeneratingAI}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {isGeneratingAI ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            <span className="text-sm">Generate</span>
                          </button>
                        </div>
                      </div>

                      {/* Message Body */}
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Message: <span className="text-xs text-muted-foreground">(Your email signature will be appended)</span>
                        </label>
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          className="w-full h-48 p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Type or generate your reply..."
                        />
                      </div>

                      {/* Signature */}
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Signature: <span className="text-xs text-muted-foreground">(Your email signature from settings)</span>
                        </label>
                        <textarea
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="w-full h-24 p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                          placeholder="Your email signature..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - AI Assistance */}
                <div className="w-80 p-6 overflow-y-auto bg-muted/30">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI Assistance
                    </h4>

                    {showAIAssistance && aiGeneratedContent ? (
                      <div className="space-y-3">
                        <div className="bg-background rounded-lg p-4 border border-border">
                          <h5 className="font-medium text-foreground mb-2">Generated Content:</h5>
                          <div className="whitespace-pre-wrap text-sm text-foreground mb-3">
                            {aiGeneratedContent}
                          </div>
                          <button
                            onClick={handleUseAIContent}
                            className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors w-full justify-center"
                          >
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Use This Content</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <p className="text-sm text-muted-foreground mb-3">
                          Click "Generate" to get AI assistance with your email response.
                        </p>
                        <button
                          onClick={handleGenerateAI}
                          disabled={isGeneratingAI}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors w-full justify-center disabled:opacity-50"
                        >
                          {isGeneratingAI ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          <span className="text-sm">Generate AI Response</span>
                        </button>
                      </div>
                    )}

                    {/* Email Preview */}
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h5 className="font-medium text-foreground mb-2">Preview:</h5>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div><strong>To:</strong> {recipientName} &lt;{recipientEmail}&gt;</div>
                        <div><strong>From:</strong> {session?.user?.name} &lt;{responseEmail}&gt;</div>
                        <div><strong>Subject:</strong> {subject}</div>
                        <div className="border-t border-border pt-1 mt-2">
                          <div className="whitespace-pre-wrap text-xs">{body}</div>
                          {signature && (
                            <div className="border-t border-border pt-1 mt-2 text-muted-foreground">
                              {signature}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-border flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  You can edit the response before sending
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isSending || !body.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-text-on-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 