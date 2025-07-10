import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { generateDashboardReport, formatReportForDisplay } from '@/lib/utils/reportGeneration';
import { useCentralizedDashboardData } from '@/lib/hooks/useCentralizedDashboardData';
import { cn } from '@/lib/utils/utils';

interface ReportButtonProps {
  selectedDateRange: string;
  className?: string;
}

export function ReportButton({ selectedDateRange, className }: ReportButtonProps) {
  const { data } = useCentralizedDashboardData();

  const handleGenerateReport = () => {
    if (data?.conversations) {
      try {
        const report = generateDashboardReport(data.conversations, selectedDateRange);
        const reportText = formatReportForDisplay(report);
        
        // Create and download the report as a text file
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${selectedDateRange}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Also trigger the custom event for any other listeners
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('dashboard:generate-report', {
            detail: { dateRange: selectedDateRange, report }
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('Failed to generate report:', error);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 px-3 text-sm font-medium", className)}
      onClick={handleGenerateReport}
    >
      <BarChart3 className="h-4 w-4 mr-2" />
      Report
    </Button>
  );
} 