import { Shield, ShieldOff } from "lucide-react"

/**
 * OverrideStatus Component
 * Displays and manages the review check override status
 */
export function OverrideStatus({ 
  isEnabled, 
  onToggle, 
  updating, 
  pulsating 
}: { 
  isEnabled: boolean; 
  onToggle: () => void; 
  updating: boolean; 
  pulsating?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={updating}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        pulsating ? 'animate-pulse ring-2 ring-yellow-400 ring-opacity-75' : ''
      }`}
    >
      {updating ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isEnabled ? (
        <ShieldOff className="w-4 h-4 text-yellow-500" />
      ) : (
        <Shield className="w-4 h-4 text-green-500" />
      )}
      <span className="text-sm font-medium">
        {isEnabled ? "Review Check Disabled" : "Review Check Enabled"}
      </span>
    </button>
  );
} 