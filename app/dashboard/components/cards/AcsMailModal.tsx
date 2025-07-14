import React from 'react';
import { Copy, Mail } from 'lucide-react';

interface AcsMailModalProps {
  open: boolean;
  onClose: () => void;
  acsMail?: string;
}

export const AcsMailModal: React.FC<AcsMailModalProps> = ({ open, onClose, acsMail }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    if (acsMail) {
      navigator.clipboard.writeText(acsMail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 relative animate-fade-in flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex flex-col items-center w-full">
          <Mail className="h-10 w-10 text-green-600 mb-2" />
          <h2 className="text-2xl font-extrabold mb-2 text-gray-900 text-center">What is your ACS mail?</h2>
          <p className="text-gray-700 mb-5 text-base text-center max-w-xs">
            <span className="font-semibold text-gray-900">Your ACS mail</span> is your unique, professional email address for all client communications and automations on ACS. Use this address to send and receive messages, connect integrations, and keep your business organized. <br /><br />
            <span className="text-gray-600">Share it with clients, add it to your email signature, or use it for calendar and CRM integrations.</span>
          </p>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 mb-4 w-full justify-center">
            <span className="font-mono text-green-700 font-semibold text-sm sm:text-base break-all select-all">{acsMail}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-green-200 transition-colors focus:outline-none"
              title="Copy ACS Email"
            >
              <Copy className={`h-5 w-5 ${copied ? 'text-green-600' : 'text-gray-400'} transition-colors`} />
            </button>
            {copied && <span className="ml-1 text-green-700 text-xs font-medium">Copied!</span>}
          </div>
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 