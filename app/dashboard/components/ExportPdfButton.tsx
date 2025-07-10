import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface ExportPdfButtonProps {
  selectedDateRange: string;
  className?: string;
}

export function ExportPdfButton({ selectedDateRange, className }: ExportPdfButtonProps) {
  const handleExportPdf = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('analytics-dashboard-content');
      
      if (element) {
        html2pdf(element, {
          margin: 10,
          filename: `analytics-report-${selectedDateRange}-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        });
      } else {
        console.warn('Analytics dashboard content element not found');
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 px-3 text-sm font-medium", className)}
      onClick={handleExportPdf}
    >
      <Download className="h-4 w-4 mr-2" />
      Export PDF
    </Button>
  );
} 