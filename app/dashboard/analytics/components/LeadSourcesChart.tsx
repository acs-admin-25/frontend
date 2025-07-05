/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This component is exported but never imported or used in the application.
 * It appears to be legacy lead sources chart functionality that was never integrated.
 * Comment in analytics page indicates this was removed.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

'use client';

import React from 'react';

interface LeadSource {
  source: string;
  percentage: number;
}

interface LeadSourcesChartProps {
  data: LeadSource[];
}

export function LeadSourcesChart({ data }: LeadSourcesChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Lead Sources</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.source} className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{item.source}</span>
            <div className="flex items-center gap-4">
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-800 w-10 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 