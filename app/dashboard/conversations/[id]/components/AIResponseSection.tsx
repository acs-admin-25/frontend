import { Sparkles, Info, Mail } from "lucide-react"
import { OverrideStatus } from "./OverrideStatus"

/**
 * AI Response Section Component
 * Handles AI response generation and editing
 */
export function AIResponseSection({ 
  messageInput, 
  onMessageChange, 
  onGenerateResponse, 
  onSendEmail, 
  generatingResponse, 
  isBusy, 
  isFlagged, 
  isFlaggedForCompletion, 
  overrideEnabled, 
  onOverrideToggle, 
  updatingOverride, 
  overrideButtonPulsing, 
  onOpenGenerateModal 
}: { 
  messageInput: string; 
  onMessageChange: (value: string) => void; 
  onGenerateResponse: () => void; 
  onSendEmail: () => void; 
  generatingResponse: boolean; 
  isBusy: boolean; 
  isFlagged: boolean; 
  isFlaggedForCompletion: boolean; 
  overrideEnabled: boolean; 
  onOverrideToggle: () => void; 
  updatingOverride: boolean; 
  overrideButtonPulsing: boolean; 
  onOpenGenerateModal: () => void; 
}) {
  return (
    <div className="bg-card rounded-2xl border shadow-lg flex flex-col flex-1 min-h-0">
      <div className="px-6 py-4 border-b bg-[#f7faf9] flex items-center gap-2 flex-shrink-0">
        <Sparkles className="h-5 w-5 text-[#0e6537]" />
        <h2 className="text-lg font-semibold flex items-center gap-2">
          AI Response
          <span className="relative group ml-2">
            <button
              type="button"
              onClick={onOpenGenerateModal}
              className="p-1 rounded-full hover:bg-[#0e6537]/10 focus:outline-none"
            >
              <Sparkles className="h-4 w-4 text-[#0e6537]" />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
              Open AI Suggestions
            </span>
          </span>
        </h2>
      </div>
      
      <div className="px-6 py-4 flex flex-col gap-4 flex-1 min-h-0">
        {/* Info banner */}
        <div className="bg-[#0e6537]/5 border border-[#0e6537]/20 rounded-lg p-3 flex items-start gap-2 flex-shrink-0">
          <Info className="h-5 w-5 text-[#0e6537] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#0e6537]">
            <p className="font-medium mb-1">Email Details</p>
            <ul className="list-disc list-inside space-y-1 text-[#0e6537]/80">
              <li>Subject will be automatically generated</li>
              <li>Your email signature will be appended</li>
              <li>You can edit the response before sending</li>
            </ul>
          </div>
        </div>

        {/* Override Status */}
        <div className="flex justify-between items-center flex-shrink-0">
          <h3 className="font-medium text-gray-900">AI Response</h3>
          <OverrideStatus 
            isEnabled={overrideEnabled} 
            onToggle={onOverrideToggle}
            updating={updatingOverride}
            pulsating={overrideButtonPulsing}
          />
        </div>

        {/* Response Textarea */}
        <div className="flex-1 flex flex-col min-h-0">
          <textarea
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={isBusy ? "Email sending in progress..." : "Type or generate your reply..."}
            className="w-full flex-1 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e6537] resize-none text-base text-gray-900 min-h-0"
            disabled={isBusy}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={onGenerateResponse}
              disabled={isBusy || generatingResponse || isFlagged || isFlaggedForCompletion}
              className="flex items-center gap-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {generatingResponse ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
            <button
              onClick={onSendEmail}
              disabled={!messageInput.trim() || isBusy}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border text-card-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 