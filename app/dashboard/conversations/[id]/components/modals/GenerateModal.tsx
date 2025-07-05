import { X, Check, RefreshCw, AlertTriangle } from "lucide-react"
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedResponse: string;
  onUseResponse: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  isFlagged?: boolean;
  modalId?: string;
}

/**
 * Generate Modal Component
 */
export const GenerateModal: React.FC<GenerateModalProps> = ({ 
  isOpen, 
  onClose, 
  generatedResponse, 
  onUseResponse, 
  onRegenerate, 
  isRegenerating, 
  isFlagged,
  modalId = 'generate-modal'
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
                <h3 className="text-lg font-semibold text-foreground">AI Response Suggestions</h3>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                {isFlagged && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        This response has been flagged for review. Please review carefully before using.
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-foreground">Generated Response:</h4>
                    <div className="whitespace-pre-wrap text-foreground">
                      {generatedResponse || 'No response generated yet.'}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={onUseResponse}
                      disabled={!generatedResponse.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>Use This Response</span>
                    </button>
                    <button
                      onClick={onRegenerate}
                      disabled={isRegenerating}
                      className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-card-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRegenerating ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>Regenerate</span>
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