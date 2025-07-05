import React from 'react';
import { cn } from '@/lib/utils/utils';

interface EVScoreScaleProps {
  score?: number;
  className?: string;
}

const segments = [
  { label: 'Low', range: [0, 39], color: 'bg-status-error', text: 'text-status-error' },
  { label: 'Moderate', range: [40, 59], color: 'bg-yellow-400', text: 'text-yellow-700' },
  { label: 'Good', range: [60, 79], color: 'bg-blue-600', text: 'text-blue-600' },
  { label: 'Excellent', range: [80, 100], color: 'bg-status-success', text: 'text-status-success' },
];

export const EVScoreScale: React.FC<EVScoreScaleProps> = ({ score, className }) => {
  // Calculate marker position as a percentage
  const markerLeft = score !== undefined ? `${Math.min(Math.max(score, 0), 100)}%` : undefined;

  return (
    <div className={cn('w-full max-w-xs mx-auto', className)} aria-label="EV Score Scale">
      <div className="relative h-5 flex rounded-full overflow-hidden border border-border bg-muted">
        {segments.map((seg, i) => {
          const width = seg.range[1] - seg.range[0] + 1;
          return (
            <div
              key={seg.label}
              className={cn(seg.color, 'h-full')}
              style={{ width: `${width}%` }}
              aria-label={`${seg.label} (${seg.range[0]}-${seg.range[1]})`}
            />
          );
        })}
        {score !== undefined && (
          <div
            className="absolute top-0 h-full flex items-center"
            style={{ left: `calc(${score}% - 8px)` }}
            aria-label={`Score marker: ${score}`}
          >
            <div className="w-4 h-4 rounded-full border-2 border-white bg-foreground shadow-lg" />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs font-medium">
        {segments.map(seg => (
          <span key={seg.label} className={cn(seg.text)}>{seg.label}</span>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}; 