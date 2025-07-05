import { AlertTriangle } from "lucide-react"

/**
 * Flagged Notification Modal Component
 */
export const FlaggedNotificationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onFocusOverrideButton: () => void;
}> = ({ isOpen, onClose, onFocusOverrideButton }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Response Flagged</h3>
              <p className="text-sm text-gray-500">AI detected potential issues</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            The AI has flagged this response for review due to potential issues. 
            You can either review and edit the response, or disable review checks to proceed.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Review Response
            </button>
            <button
              onClick={onFocusOverrideButton}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Disable Checks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 