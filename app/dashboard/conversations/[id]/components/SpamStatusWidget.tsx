import { AlertTriangle, Shield, CheckCircle, Info, Ban, Clock } from "lucide-react"
import type { Conversation } from '@/lib/types/conversation';
import type { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';

/**
 * Spam Status Widget Component
 * Displays and manages spam status with enhanced information
 */
export function SpamStatusWidget({ 
  widget,
  conversation,
  actions,
  state,
  onRemoveWidget,
  onMakeWidgetFloat,
  className
}: { 
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}) {
  const isSpam = conversation?.thread?.spam || false;
  
  if (!isSpam) {
    return (
      <div className="w-full h-full flex flex-col p-4">
        <div className="space-y-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Spam Status</h3>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Clean Status */}
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-8 w-8 text-status-success" />
            </div>
            <h4 className="font-semibold text-foreground text-sm mb-2">Legitimate Conversation</h4>
            <p className="text-xs text-muted-foreground mb-3">
              This conversation has not been flagged as spam and appears to be legitimate
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3" />
              <span>No spam detected</span>
            </div>
          </div>
          
          {/* Info Section */}
          <div className="bg-muted/30 rounded-lg p-3">
            <h5 className="text-xs font-medium text-foreground mb-2">Spam Detection</h5>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Shield className="w-3 h-3 mt-0.5 text-status-success" />
                <span>AI analyzes messages for spam indicators</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 text-warning" />
                <span>Spam conversations are automatically flagged</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 mt-0.5 text-muted-foreground" />
                <span>You can manually mark conversations as not spam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Spam Status</h3>
          <Ban className="w-4 h-4 text-status-error" />
        </div>

        {/* Status Info */}
        <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-status-error/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-status-error" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm mb-1">Marked as Spam</h4>
              <p className="text-xs text-muted-foreground mb-2">
                This conversation has been flagged as spam by our AI system. Review the content to determine if this is a false positive.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Requires review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={actions.onMarkAsNotSpam}
          disabled={state.updatingSpam}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-status-success text-white rounded-lg hover:bg-status-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.updatingSpam ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Mark as Not Spam</span>
            </>
          )}
        </button>
        
        {/* Help Text */}
        <div className="bg-muted/30 rounded-lg p-3">
          <h5 className="text-xs font-medium text-foreground mb-2">What to check:</h5>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
              <span>Review the sender's email address for legitimacy</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
              <span>Check message content for suspicious patterns</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
              <span>Look for urgent requests or unusual language</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
              <span>Verify if this is a legitimate client inquiry</span>
            </div>
          </div>
        </div>
        
        {/* Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Only mark as "Not Spam" if you're confident this is a legitimate conversation. This helps improve our spam detection system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 