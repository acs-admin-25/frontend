import React, { useState, useRef, useEffect } from 'react';
import { X, ThumbsDown, Meh, ThumbsUp, Star, ArrowRight, ArrowLeft, TrendingUp, Repeat, MessageCircle, CheckCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { EVScoreScale } from './EVScoreScale';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useModal } from '@/components/providers/ModalProvider';

interface EVScoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  score?: number;
  modalId?: string;
}

const scoreRanges = [
  {
    label: 'Low',
    range: '0–39',
    color: 'bg-status-error',
    icon: ThumbsDown,
    desc: 'Low engagement',
    action: 'Try new approach',
    chipColor: 'bg-white/80 text-status-error',
    iconColor: 'text-white',
  },
  {
    label: 'Moderate',
    range: '40–59',
    color: 'bg-yellow-400',
    icon: Meh,
    desc: 'Some interest',
    action: 'Nurture lead',
    chipColor: 'bg-yellow-100 text-yellow-700',
    iconColor: 'text-white',
  },
  {
    label: 'Good',
    range: '60–79',
    color: 'bg-blue-600',
    icon: ThumbsUp,
    desc: 'Interested',
    action: 'Follow up',
    chipColor: 'bg-blue-100 text-blue-600',
    iconColor: 'text-white',
  },
  {
    label: 'Excellent',
    range: '80–100',
    color: 'bg-status-success',
    icon: Star,
    desc: 'Highly engaged',
    action: 'Act now',
    chipColor: 'bg-white/80 text-status-success',
    iconColor: 'text-white',
  },
];

const steps = [
  {
    icon: CheckCircle,
    title: 'Spot High Scores',
    desc: 'Prioritize hot leads',
    color: 'text-status-success',
  },
  {
    icon: MessageCircle,
    title: 'Nurture Medium',
    desc: 'Send more info',
    color: 'text-blue-600',
  },
  {
    icon: Repeat,
    title: 'Re-engage Low',
    desc: 'Try a new approach',
    color: 'text-status-error',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    desc: 'Watch score improve',
    color: 'text-accent',
  },
];

function EVScoreFullGuideModal({ isOpen, onClose, onBack }: { isOpen: boolean; onClose: () => void; onBack: () => void }) {
  const router = useRouter();
  // Real, concise, visually appealing guide steps
  const guideSteps = [
    {
      icon: Star,
      title: 'What is EV Score?',
      desc: 'A 0–100 number that predicts how likely a lead is to convert, powered by AI.',
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      title: 'How is it calculated?',
      desc: 'AI analyzes message content, sentiment, and engagement patterns. The score updates as you interact.',
      color: 'text-accent',
    },
    {
      icon: CheckCircle,
      title: 'How to use it?',
      desc: 'Prioritize high scores, nurture medium, re-engage low. Track progress as scores change.',
      color: 'text-status-success',
    },
    {
      icon: MessageCircle,
      title: 'Example',
      desc: 'Lead A (92): Hot, act now. Lead B (55): Nurture. Lead C (20): Try new approach.',
      color: 'text-blue-600',
    },
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0.18 }}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="relative bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-full sm:max-w-2xl md:max-w-4xl xl:max-w-5xl min-w-0 mx-auto overflow-hidden animate-gradient-x flex flex-col p-2 sm:p-6 overflow-y-auto"
              style={{ height: 'auto', minHeight: 400, maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x" />
              <div className="flex items-center justify-between px-6 sm:px-10 py-7 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h3 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">Full EV Score Guide</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onBack}
                    className="text-muted-foreground hover:text-primary transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>
              </div>
              {/* Modern, concise, visually appealing guide steps */}
              <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-8 bg-gradient-to-br from-card via-background to-muted/60" style={{ overflow: 'hidden' }}>
                <div className="w-full flex flex-col gap-6 sm:gap-8 items-center justify-center" style={{ maxWidth: 950 }}>
                  <EVScoreScale className="mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {guideSteps.map((step, i) => (
                      <div
                        key={step.title}
                        className="rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-md bg-card border border-border max-w-xs min-w-0 w-full overflow-hidden"
                        style={{ minWidth: 0 }}
                      >
                        <step.icon className={cn('w-8 h-8 sm:w-10 sm:h-10 mb-2', step.color)} />
                        <div className="font-bold text-base sm:text-lg mb-1 text-card-foreground text-center break-words whitespace-normal w-full">{step.title}</div>
                        <div className="text-sm sm:text-base text-muted-foreground text-center break-words whitespace-normal w-full">{step.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function EVScoreInfoModal({ isOpen, onClose, score, modalId = 'ev-score-modal' }: EVScoreInfoModalProps) {
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { activeModal, openModal, closeModal } = useModal();
  
  // Store the previous path only once, when the main modal is first opened
  const prevPathRef = useRef<string | null>(null);
  const [initialPrevPath, setInitialPrevPath] = useState<string | null>(null);

  // Use global modal state
  const isActuallyOpen = isOpen && activeModal === modalId;

  useEffect(() => {
    if (isOpen && !prevPathRef.current) {
      prevPathRef.current = pathname;
      setInitialPrevPath(pathname);
      openModal(modalId);
    }
    if (!isOpen) {
      prevPathRef.current = null;
      setInitialPrevPath(null);
      setShowGuide(false); // Reset guide state when modal closes
      closeModal(modalId);
    }
  }, [isOpen, pathname, modalId, openModal, closeModal]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isActuallyOpen && !showGuide && (
          <>
            {/* Overlay with fade-in */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleOverlayClick}
            />
            {/* Modal panel with slide+fade-in */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.18 }}
              aria-modal="true"
              role="dialog"
            >
              <div
                className="relative bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-full sm:max-w-2xl md:max-w-4xl xl:max-w-5xl min-w-0 mx-auto overflow-hidden animate-gradient-x flex flex-col p-2 sm:p-6 overflow-y-auto"
                style={{ height: 'auto', minHeight: 400, maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Top accent bar with ACS gradient */}
                <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x" />
                {/* Header */}
                <div className="flex flex-col items-center justify-center px-6 sm:px-12 pt-8 sm:pt-10 pb-4 border-b border-border bg-card/80 backdrop-blur-sm relative">
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close"
                  >
                    <X className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-2 text-center">EV Score Explained</h3>
                  <div className="text-base sm:text-lg text-muted-foreground font-medium mb-2 text-center">AI-powered lead prioritization</div>
                  <div className="h-1 w-32 rounded-full bg-gradient-to-r from-primary via-accent to-secondary mb-2" />
                </div>
                {/* Main content */}
                <div className="flex-1 flex flex-col gap-6 sm:gap-8 px-6 sm:px-12 py-6 sm:py-8 bg-gradient-to-br from-card via-background to-muted/60">
                  {/* EV Score scale */}
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
                    <EVScoreScale score={score} className="mb-6 sm:mb-8" />
                  </motion.div>
                  {/* Score range cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {scoreRanges.map((range, i) => (
                      <motion.div
                        key={range.label}
                        className={cn(
                          'rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-md',
                          range.color
                        )}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                      >
                        <range.icon className={cn('w-8 h-8 sm:w-10 sm:h-10 mb-2', range.iconColor)} />
                        <div className="font-bold text-lg sm:text-xl mb-1 text-card-foreground text-center">{range.label}</div>
                        <div className="text-xs font-semibold mb-1 text-card-foreground">{range.range}</div>
                        <div className="text-sm sm:text-base text-card-foreground text-center mb-2">{range.desc}</div>
                        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', range.chipColor)}>{range.action}</span>
                      </motion.div>
                    ))}
                  </div>
                  {/* How to use steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {steps.map((step, i) => (
                      <motion.div
                        key={step.title}
                        className="bg-card rounded-xl shadow flex flex-col items-center justify-center p-4 sm:p-6 border border-border"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                      >
                        <step.icon className={cn('w-8 h-8 sm:w-9 sm:h-9 mb-2', step.color)} />
                        <div className="font-bold text-base sm:text-lg mb-1 text-card-foreground text-center">{step.title}</div>
                        <div className="text-sm sm:text-base text-muted-foreground text-center">{step.desc}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Action button */}
                <div className="flex items-center justify-center py-6 sm:py-7 border-t border-border bg-card/80">
                  <button
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary text-white font-bold text-lg sm:text-xl shadow-md hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-2"
                    onClick={() => setShowGuide(true)}
                    type="button"
                  >
                    See Full EV Score Guide <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <EVScoreFullGuideModal isOpen={showGuide && isActuallyOpen} onClose={onClose} onBack={() => setShowGuide(false)} />
    </>
  );
} 