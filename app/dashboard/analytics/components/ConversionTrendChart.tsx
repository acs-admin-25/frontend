/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This component is exported but never imported or used in the application.
 * It appears to be legacy conversion trend chart functionality that was never integrated.
 * Comment in analytics page indicates this was removed.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

'use client';

import React from 'react';

interface ConversionTrendData {
  month: string;
  conversion: number;
  leads: number;
}

interface ConversionTrendChartProps {
  data: ConversionTrendData[];
}

export function ConversionTrendChart({ data }: ConversionTrendChartProps) {
  const maxLeads = Math.max(...data.map(d => d.leads), 0);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Conversion Trends</h3>
      <div className="h-64 flex items-end justify-between gap-4 bg-gray-50 rounded-lg p-4">
        {data.map((item) => (
          <div key={item.month} className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-end gap-1 w-full h-full">
              <div
                title={`Conversion: ${item.conversion}%`}
                className="w-1/2 bg-blue-500 rounded-sm"
                style={{ height: `${(item.conversion / 100) * 100}%` }}
              ></div>
              <div
                title={`Leads: ${item.leads}`}
                className="w-1/2 bg-blue-200 rounded-sm"
                style={{ height: `${(item.leads / maxLeads) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-600">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm font-medium text-gray-700">Conversion %</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <span className="text-sm font-medium text-gray-700">Leads</span>
        </div>
      </div>
    </div>
  );
} 