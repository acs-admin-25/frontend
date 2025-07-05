import { X } from "lucide-react"
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  subject: string;
  body: string;
  signature: string;
  recipientEmail: string;
  recipientName: string;
  isSending: boolean;
  session: any;
  responseEmail: string;
  modalId?: string;
}

/**
 * Email Preview Modal Component
 */
export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend, 
  subject, 
  body, 
  signature, 
  recipientEmail, 
  recipientName, 
  isSending, 
  session, 
  responseEmail,
  modalId = 'email-preview-modal'
}) => {
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
              className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Email Preview</h3>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">To:</h4>
                    <p className="text-muted-foreground">{recipientName} &lt;{recipientEmail}&gt;</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">From:</h4>
                    <p className="text-muted-foreground">{session?.user?.name} &lt;{responseEmail}&gt;</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">Subject:</h4>
                    <p className="text-muted-foreground">{subject}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">Message:</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="whitespace-pre-wrap text-foreground mb-4">{body}</div>
                      {signature && (
                        <div className="border-t border-border pt-4">
                          <div className="whitespace-pre-wrap text-muted-foreground text-sm">{signature}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onSend}
                      disabled={isSending}
                      className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 