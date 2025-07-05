import { Copy, Check, Download, RefreshCw } from "lucide-react"

/**
 * Conversation Header Component
 * Displays the conversation title and action buttons
 */
export function ConversationHeader({ 
  copySuccess, 
  onCopy, 
  generatingPdf, 
  onGeneratePdf 
}: { 
  copySuccess: boolean; 
  onCopy: () => void; 
  generatingPdf: boolean; 
  onGeneratePdf: () => void; 
}) {
  return (
    <div className="px-8 py-4 border-b bg-[#f7faf9] flex items-center justify-between flex-shrink-0">
      <h2 className="text-xl font-semibold">Conversation History</h2>
      <div className="flex gap-2">
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-sm"
          title="Copy conversation to clipboard"
        >
          {copySuccess ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Copy</span>
            </>
          )}
        </button>
        <button
          onClick={onGeneratePdf}
          disabled={generatingPdf}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-sm disabled:opacity-50"
          title="Download conversation as PDF"
        >
          {generatingPdf ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span className="text-sm">PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 