import { AlertTriangle, Shield } from "lucide-react"
import type { Conversation } from '@/types/conversation';

/**
 * Spam Status Widget Component
 * Displays and manages spam status
 */
export function SpamStatusWidget({ 
  conversation,
  onMarkAsNotSpam, 
  updating 
}: { 
  conversation: Conversation | null;
  onMarkAsNotSpam: () => void; 
  updating: boolean;
}) {
  const isSpam = conversation?.thread?.spam || false;
  
  if (!isSpam) return null;

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <div className="mb-1 font-bold text-lg text-red-700">Marked as Spam</div>
      <div className="text-gray-500 text-sm mb-4">
        This conversation has been marked as spam
      </div>
      <button
        onClick={onMarkAsNotSpam}
        disabled={updating}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-card-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Shield className="w-4 h-4 text-green-500" />
            <span>Mark as Not Spam</span>
          </>
        )}
      </button>
    </div>
  );
} 