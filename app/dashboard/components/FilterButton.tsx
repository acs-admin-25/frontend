import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download, BarChart3, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExportPdfButton } from './ExportPdfButton';
import { ReportButton } from './ReportButton';
import { TimeFilterSelector } from './TimeFilterSelector';

type DateRange = '24h' | '7d' | '30d' | '3m' | '6m' | '1y';

interface FilterButtonProps {
  selectedDateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function FilterButton({ selectedDateRange, onDateRangeChange, className }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 text-sm font-medium",
            isOpen && "bg-green-100 text-green-700",
            className
          )}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border border-border shadow-lg" align="end">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-900">Time Range</h4>
            </div>
            <div className="pl-6">
              <TimeFilterSelector 
                selectedDateRange={selectedDateRange}
                onDateRangeChange={onDateRangeChange}
                className="w-full justify-start"
              />
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-900">Export Options</h4>
            </div>
            <div className="pl-6 space-y-2">
              <ExportPdfButton 
                selectedDateRange={selectedDateRange}
                className="w-full justify-start"
              />
              <ReportButton 
                selectedDateRange={selectedDateRange}
                className="w-full justify-start"
              />
            </div>
          </div>

          {/* Key Metrics Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-900">Key Metrics</h4>
            </div>
            <div className="pl-6 space-y-3">
              <div className="text-sm text-gray-600">
                <p>Configure which metrics to display on the dashboard.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coming soon: Custom metric selection and thresholds
                </p>
              </div>
            </div>
          </div>

          {/* Additional Filters Placeholder */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-900">Advanced Filters</h4>
            </div>
            <div className="pl-6">
              <div className="text-sm text-gray-600">
                <p>Filter by lead source, status, or custom criteria.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coming soon: Advanced filtering options
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-3 flex justify-between">
            <button
              onClick={() => {
                onDateRangeChange('7d');
                setIsOpen(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 