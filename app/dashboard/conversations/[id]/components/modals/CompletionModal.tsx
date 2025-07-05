import { useState, type ReactNode, useEffect } from "react"
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reason: string, nextSteps: string) => void;
  isSubmitting: boolean;
  leadName: string;
  clientEmail: string;
  modalId?: string;
}

/**
 * Completion Modal Component
 */
export const CompletionModal: React.FC<CompletionModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  isSubmitting, 
  leadName, 
  clientEmail,
  modalId = 'completion-modal'
}) => {
  const [reason, setReason] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [customReason, setCustomReason] = useState('');
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

  const reasons = [
    'Lead converted to client',
    'Lead not interested',
    'Lead went with competitor',
    'Lead needs more time',
    'Lead unresponsive',
    'Other'
  ];

  const handleSubmit = () => {
    const finalReason = reason === 'Other' ? customReason : reason;
    if (finalReason.trim()) {
      onComplete(finalReason, nextSteps);
    }
  };

  const handleReasonSelect = (selectedReason: string) => {
    setReason(selectedReason);
    if (selectedReason !== 'Other') {
      setCustomReason('');
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
              className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Complete Conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Mark this conversation as complete for {leadName} ({clientEmail})
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Reason for completion
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => handleReasonSelect(e.target.value)}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground"
                    >
                      <option value="">Select a reason</option>
                      {reasons.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  
                  {reason === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Custom reason
                      </label>
                      <input
                        type="text"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground"
                        placeholder="Enter custom reason"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Next steps (optional)
                    </label>
                    <textarea
                      value={nextSteps}
                      onChange={(e) => setNextSteps(e.target.value)}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground"
                      rows={3}
                      placeholder="Any follow-up actions or notes"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !reason.trim() || (reason === 'Other' && !customReason.trim())}
                    className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Completing...' : 'Complete'}
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