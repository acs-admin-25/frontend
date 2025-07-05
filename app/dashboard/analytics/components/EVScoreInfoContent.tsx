import React from 'react';
import { EVScoreScale } from './EVScoreScale';

export const EVScoreInfoContent: React.FC<{ score?: number }> = ({ score }) => (
  <div className="space-y-3">
    <EVScoreScale score={score} />
    <div className="text-sm text-muted-foreground mt-2">
      <p><strong>EV Score</strong> (Engagement Value Score) measures how likely a conversation or message is to lead to a positive outcome, based on AI analysis of content, tone, and engagement.</p>
      <ul className="mt-2 list-disc list-inside space-y-1">
        <li><span className="font-semibold text-status-success">80–100 (Excellent):</span> Highly engaged, likely to convert.</li>
        <li><span className="font-semibold text-blue-500">60–79 (Good):</span> Interested, follow up recommended.</li>
        <li><span className="font-semibold text-yellow-700">40–59 (Moderate):</span> Some interest, nurture further.</li>
        <li><span className="font-semibold text-status-error">0–39 (Low):</span> Low engagement, consider re-engagement or focus elsewhere.</li>
      </ul>
      <p className="mt-2">Use the EV Score to prioritize your leads and focus on those most likely to convert.</p>
    </div>
  </div>
); 