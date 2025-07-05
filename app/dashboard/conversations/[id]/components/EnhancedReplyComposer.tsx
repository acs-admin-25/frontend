import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  Link, 
  Sparkles, 
  Send, 
  FileText, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Conversation } from '@/types/conversation';

export interface EnhancedReplyComposerProps {
  conversation: Conversation | null;
  messageInput: string;
  onMessageChange: (value: string) => void;
  onGenerateResponse: () => void;
  onSendEmail: () => void;
  generatingResponse: boolean;
  isBusy: boolean;
  onOverrideToggle: () => void;
  updatingOverride: boolean;
  onOpenGenerateModal: () => void;
  className?: string;
}

export function EnhancedReplyComposer({
  conversation,
  messageInput,
  onMessageChange,
  onGenerateResponse,
  onSendEmail,
  generatingResponse,
  isBusy,
  onOverrideToggle,
  updatingOverride,
  onOpenGenerateModal,
  className
}: EnhancedReplyComposerProps) {
  const [activeTab, setActiveTab] = useState('ai-response');
  const [showSignature, setShowSignature] = useState(true);

  // Extract status from conversation
  const isFlagged = conversation?.thread?.flag_for_review || false;
  const isFlaggedForCompletion = conversation?.thread?.flag || false;
  const overrideEnabled = conversation?.thread?.flag_review_override || false;

  const formatText = (format: 'bold' | 'italic' | 'list' | 'link') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = messageInput.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = `• ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
    }

    const newText = messageInput.substring(0, start) + formattedText + messageInput.substring(end);
    onMessageChange(newText);
  };

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Reply & AI Tools</h3>
          <div className="flex items-center gap-2">
            {overrideEnabled && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                <CheckCircle className="w-3 h-3" />
                Review Check Enabled
              </div>
            )}
            {isFlagged && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                <AlertCircle className="w-3 h-3" />
                Flagged for Review
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai-response" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Response
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="snippets" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Snippets
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col px-6 pb-6">
          <TabsContent value="ai-response" className="flex-1 flex flex-col mt-4">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg mb-4">
              <button
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => formatText('list')}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="List"
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => formatText('link')}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Link"
              >
                <Link className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Text Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                value={messageInput}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder={isBusy ? "Email sending in progress..." : "Type or generate your reply..."}
                className="w-full flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e6537] resize-none text-base text-gray-900 min-h-0"
                disabled={isBusy}
              />
            </div>

            {/* Signature Toggle */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="signature-toggle"
                checked={showSignature}
                onChange={(e) => setShowSignature(e.target.checked)}
                className="rounded border-gray-300 text-[#0e6537] focus:ring-[#0e6537]"
              />
              <label htmlFor="signature-toggle" className="text-sm text-gray-600">
                Include signature
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={onGenerateResponse}
                disabled={isBusy || generatingResponse || isFlagged || isFlaggedForCompletion}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-card-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Email Templates</h4>
              <div className="space-y-2">
                {[
                  'Welcome Message',
                  'Follow-up Inquiry',
                  'Property Details Request',
                  'Meeting Scheduling',
                  'Thank You Note'
                ].map((template) => (
                  <button
                    key={template}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{template}</p>
                    <p className="text-sm text-gray-500">Click to insert template</p>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="snippets" className="flex-1 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Quick Snippets</h4>
              <div className="space-y-2">
                {[
                  'Thank you for your inquiry',
                  'I\'ll get back to you shortly',
                  'Let me check on that for you',
                  'Here are the details you requested',
                  'Is there anything else I can help with?'
                ].map((snippet) => (
                  <button
                    key={snippet}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-gray-900">{snippet}</p>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 