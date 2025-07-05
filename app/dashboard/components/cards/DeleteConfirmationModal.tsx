'use client';

import { AlertTriangle } from 'lucide-react';
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

  // this is dead code


interface DeleteConfirmationModalProps {
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void;
    conversationName: string;
    isDeleting: boolean;
    modalId?: string;
}

const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    conversationName, 
    isDeleting,
    modalId = 'delete-confirmation-modal'
}: DeleteConfirmationModalProps) => {
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
                        className="fixed inset-0 z-50 bg-black/60"
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
                            className="bg-card text-card-foreground border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Delete Conversation</h3>
                            </div>
                            
                            <p className="text-muted-foreground mb-6">
                                Are you sure you want to delete the conversation with <span className="font-medium text-foreground">{conversationName}</span>? 
                                This action cannot be reversed.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className={`px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg transition-colors ${
                                        isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/80'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg transition-colors flex items-center gap-2 ${
                                        isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                                    }`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DeleteConfirmationModal; 