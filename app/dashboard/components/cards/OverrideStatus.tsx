/**
 * File: app/dashboard/components/OverrideStatus.tsx
 * Purpose: Renders a status indicator for AI review override settings with tooltip information.
 * Author: Alejo Cagliolo
 * Date: 6/11/25
 * Version: 1.0.0
 */

'use client';


import { Shield, ShieldOff } from 'lucide-react';

/**
 * OverrideStatus Component
 * Displays a visual indicator for AI review override status with an informative tooltip
 * 
 * Features:
 * - Visual status indicator (Shield/ShieldOff icons)
 * - Interactive tooltip with detailed status information
 * - Responsive design with different icon sizes
 * - Hover effects for better user interaction
 * 
 * Props:
 * @param {boolean} isEnabled - Controls the override status display
 *   - true: Shows disabled status (ShieldOff icon)
 *   - false: Shows enabled status (Shield icon)
 * 
 * Styling:
 * - Uses Tailwind CSS for styling
 * - Implements hover effects and transitions
 * - Color-coded status indicators (yellow for disabled, green for enabled)
 * 
 * @returns {JSX.Element} Status indicator with tooltip
 */
const OverrideStatus = ({ isEnabled }: { isEnabled: boolean }) => {
    return (
        <div className="relative inline-flex items-center p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="group inline-flex items-center">
                {isEnabled ? (
                    <ShieldOff className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                ) : (
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-20">
                    {isEnabled ? (
                        "AI review checks are disabled for this conversation. The AI will not flag this conversation for review, even if it detects potential issues."
                    ) : (
                        "AI review checks are enabled. The AI will flag this conversation for review if it detects any uncertainty or issues that need human attention."
                    )}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                </div>
            </span>
        </div>
    );
};

export default OverrideStatus;

/**
 * Change Log:
 * 6/11/25 - Initial version
 * - Created OverrideStatus component
 * - Implemented responsive design
 * - Added interactive tooltip
 * - Integrated Lucide icons
 * - Added hover effects and transitions
 * - Implemented accessibility features
 */ 