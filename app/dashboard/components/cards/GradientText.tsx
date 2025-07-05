/**
 * File: app/dashboard/components/GradientText.tsx
 * Purpose: Renders text with dynamic gradient styling based on message type and status.
 * Author: Anay Pant
 * Date: 06/11/25
 * Version: 1.0.1
 */

'use client';

  // this is dead code


import React from 'react';

/**
 * Props interface for GradientText component
 * @interface GradientTextProps
 * @property {string} text - The text content to be displayed with gradient
 * @property {boolean} [isPending] - Whether the message is pending a response
 * @property {string} [messageType] - Type of message (inbound-email, outbound-email)
 */
interface GradientTextProps {
    text: string;
    isPending?: boolean;
    messageType?: string;
}

/**
 * GradientText Component
 * Displays text with dynamic gradient styling based on message context
 * 
 * Features:
 * - Dynamic gradient colors based on message type
 * - Text truncation for long content
 * - Responsive text display
 * - Line clamping for consistent layout
 * - Color coding for different message states
 * 
 * Gradient Colors:
 * - Pending: Amber gradient
 * - Inbound Email: Blue gradient
 * - Outbound Email: Green gradient
 * - Default: Gray gradient
 * 
 * @param {GradientTextProps} props - Component props
 * @returns {JSX.Element} Text element with gradient styling
 */
const GradientText: React.FC<GradientTextProps> = ({ text, isPending, messageType }) => {
    // Truncate text to a reasonable length
    const truncatedText = text.length > 150 ? text.substring(0, 150) + '...' : text;

    // Determine the gradient based on message type and pending status
    let gradientClass = 'bg-gradient-to-r from-gray-600 to-gray-400';
    if (isPending) {
        gradientClass = 'bg-gradient-to-r from-amber-600 to-amber-400';
    } else if (messageType === 'inbound-email') {
        gradientClass = 'bg-gradient-to-r from-blue-600 to-blue-400';
    } else if (messageType === 'outbound-email') {
        gradientClass = 'bg-gradient-to-r from-green-600 to-green-400';
    }

    return (
        <div className="w-full max-w-full overflow-hidden">
            <p className={`text-sm text-transparent bg-clip-text ${gradientClass} line-clamp-2`}>
                {truncatedText}
            </p>
        </div>
    );
};

export default GradientText;

/**
 * Change Log:
 * 06/11/25 - Version 1.0.1
 * - Enhanced gradient color system
 * - Improved text truncation
 * - Added comprehensive documentation
 * - Optimized performance
 * 
 * 5/25/25 - Version 1.0.0
 * - Initial implementation
 * - Basic gradient text functionality
 * - Message type color coding
 * - Text truncation feature
 */ 