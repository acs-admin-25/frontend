import { Flag, CheckCircle, X, AlertTriangle, Clock, Info } from "lucide-react"
import type { Conversation } from '@/lib/types/conversation';
import type { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';

/**
 * Flagged Status Widget Component
 * Displays and manages conversation flags with enhanced information
 */
export function FlaggedStatusWidget({ 
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
  const isFlagged = conversation?.thread?.flag_for_review || false;
  const isFlaggedForCompletion = conversation?.thread?.flag || false;
  
  if (!isFlagged && !isFlaggedForCompletion) {
    return (
      <div className="w-full h-full flex flex-col p-4">
        <div className="space-y-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Flagged Status</h3>
            <Flag className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Clean Status */}
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-status-success" />
            </div>
            <h4 className="font-semibold text-foreground text-sm mb-2">All Clear</h4>
            <p className="text-xs text-muted-foreground mb-3">
              This conversation is proceeding normally without any flags
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>No action needed</span>
            </div>
          </div>
          
          {/* Info Section */}
          <div className="bg-muted/30 rounded-lg p-3">
            <h5 className="text-xs font-medium text-foreground mb-2">About Flags</h5>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 text-warning" />
                <span>Review flags appear when AI detects issues</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-status-success" />
                <span>Completion flags indicate ready to close</span>
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
          <h3 className="text-sm font-semibold text-foreground">Flagged Status</h3>
          <Flag className="w-4 h-4 text-warning" />
        </div>

        {/* Status Info */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
              {isFlaggedForCompletion ? (
                <CheckCircle className="h-5 w-5 text-warning" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm mb-1">
                {isFlaggedForCompletion ? 'Ready for Completion' : 'Flagged for Review'}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {isFlaggedForCompletion 
                  ? 'This conversation has been marked as ready to be completed. Review the conversation and close it when appropriate.'
                  : 'This conversation has been flagged for human review. Please review the content and take appropriate action.'
                }
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Requires attention</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          {isFlagged && (
            <button
              onClick={actions.onUnflag}
              disabled={state.unflagging}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border text-card-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.unflagging ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 text-status-success" />
              )}
              <span className="text-sm font-medium">Clear Review Flag</span>
            </button>
          )}
          
          {isFlaggedForCompletion && actions.onComplete && (
            <button
              onClick={actions.onComplete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-status-success text-white rounded-lg hover:bg-status-success/90 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Complete Conversation</span>
            </button>
          )}
          
          {isFlaggedForCompletion && actions.onClearFlag && (
            <button
              onClick={actions.onClearFlag}
              disabled={state.clearingFlag}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border text-card-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.clearingFlag ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Remove Completion Flag</span>
            </button>
          )}
        </div>
        
        {/* Help Text */}
        <div className="bg-muted/30 rounded-lg p-3">
          <h5 className="text-xs font-medium text-foreground mb-2">What to do next:</h5>
          <div className="space-y-1 text-xs text-muted-foreground">
            {isFlagged && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                <span>Review the conversation for any issues or concerns</span>
              </div>
            )}
            {isFlaggedForCompletion && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                <span>Verify all client needs have been addressed</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
              <span>Take appropriate action based on the conversation content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 