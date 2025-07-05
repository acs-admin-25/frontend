"use client";

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AlertTriangle, Trash2, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export function DangerZone() {
    const { data: session } = useSession();
    const [openDialog, setOpenDialog] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { activeModal, openModal, closeModal } = useModal();
    
    const modalId = 'danger-zone-delete-modal';
    const isActuallyOpen = openDialog && activeModal === modalId;

    useEffect(() => {
        if (openDialog) {
            openModal(modalId);
        } else {
            closeModal(modalId);
        }
    }, [openDialog, modalId, openModal, closeModal]);

    const handleDeleteAccount = async () => {
        if (emailInput !== session?.user?.email) return;
        
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('/api/auth/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: (session as any)?.user?.id }),
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete account.');
            }

            setSuccess(true);
            // Auto-redirect after 2 seconds
            setTimeout(() => {
                signOut({ callbackUrl: '/' });
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetDialog = () => {
        setOpenDialog(false);
        setEmailInput('');
        setError(null);
        setSuccess(false);
    };

    return (
        <section id="danger" className="bg-card text-card-foreground rounded-xl border border-red-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-red-200 bg-gradient-to-r from-red-600 to-red-700">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h2>
                <p className="text-sm text-red-100 mt-1">Irreversible actions that will permanently affect your account</p>
            </div>
            
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
                            <p className="mt-1 text-sm text-red-700">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <ul className="mt-2 text-xs text-red-600 space-y-1">
                                <li>• All conversations and messages will be deleted</li>
                                <li>• Your profile and settings will be removed</li>
                                <li>• This action is irreversible</li>
                            </ul>
                        </div>
                        <button 
                            onClick={() => setOpenDialog(true)}
                            className={cn(
                                "ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md"
                            )}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isActuallyOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-50 bg-gray-900/75"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={resetDialog}
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
                                className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="px-6 pt-6 pb-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                                <AlertTriangle className="h-6 w-6 text-red-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                Delete Account
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-muted-foreground">
                                                    Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
                                                </p>
                                                
                                                <div className="mt-4">
                                                    <label htmlFor="confirm-email" className="block text-sm font-medium text-foreground mb-2">
                                                        Type your email to confirm
                                                    </label>
                                                    <input 
                                                        type="email" 
                                                        id="confirm-email"
                                                        value={emailInput} 
                                                        onChange={(e) => setEmailInput(e.target.value)}
                                                        placeholder={session?.user?.email || ''}
                                                        className={cn(
                                                            "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                                            "focus:ring-2 focus:ring-red-500/50 focus:border-red-500",
                                                            "bg-card text-foreground placeholder-muted-foreground",
                                                            error ? "border-red-300" : "border-border"
                                                        )}
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Expected: <span className="font-mono">{session?.user?.email}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Status Messages */}
                                {error && (
                                    <div className="px-6 pb-4">
                                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {success && (
                                    <div className="px-6 pb-4">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <p className="text-sm text-green-700">Account deleted successfully. Redirecting...</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="bg-muted/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                                    <button 
                                        type="button" 
                                        onClick={resetDialog}
                                        disabled={loading}
                                        className={cn(
                                            "mt-3 sm:mt-0 inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                            "border border-border bg-card text-muted-foreground hover:bg-muted focus:ring-border",
                                            loading && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        disabled={loading || emailInput !== session?.user?.email || success}
                                        onClick={handleDeleteAccount}
                                        className={cn(
                                            "inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                            loading || emailInput !== session?.user?.email || success
                                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md"
                                        )}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Deleting...
                                            </>
                                        ) : success ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Deleted
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Delete Account
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
} 