import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateRange = '24h' | '7d' | '30d' | '3m' | '6m' | '1y';

interface TimeFilterSelectorProps {
  selectedDateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function TimeFilterSelector({ selectedDateRange, onDateRangeChange, className }: TimeFilterSelectorProps) {
  const getDisplayText = (range: DateRange) => {
    switch (range) {
      case '24h':
        return 'Last 24 Hours';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      case '3m':
        return 'Last 3 Months';
      case '6m':
        return 'Last 6 Months';
      case '1y':
        return 'Last 1 Year';
      default:
        return 'Last 30 Days';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-3 text-sm font-medium ${className || ''}`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {getDisplayText(selectedDateRange)}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 bg-white border border-border shadow-lg" align="start">
        <div className="p-2">
          <div className="space-y-1">
            {[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '3m', label: 'Last 3 Months' },
              { value: '6m', label: 'Last 6 Months' },
              { value: '1y', label: 'Last 1 Year' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => onDateRangeChange(range.value as DateRange)}
                className={cn(
                  "w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors",
                  selectedDateRange === range.value
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="border-t border-border mt-2 pt-2">
            <button 
              onClick={() => onDateRangeChange('7d')}
              className="w-full flex items-center justify-center px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 