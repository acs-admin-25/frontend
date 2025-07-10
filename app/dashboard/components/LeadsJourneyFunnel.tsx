import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ExternalLink } from 'lucide-react';
import { Conversation } from '@/types/conversation';
import { DateRange } from '../tabs/DashboardTabs';
import { generateChartData } from '@/lib/utils/analytics';

interface LeadsJourneyFunnelProps {
  conversations: Conversation[];
  selectedDateRange: DateRange;
}

export function LeadsJourneyFunnel({ conversations, selectedDateRange }: LeadsJourneyFunnelProps) {
  const chartData = generateChartData(conversations, selectedDateRange);

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Leads Journey Funnel</h3>
        <button className="p-1 hover:bg-gray-100 rounded">
          <ExternalLink className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Donut Chart */}
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.leadsFunnelData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.leadsFunnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 pb-2">
          <span>Source</span>
          <span className="text-right">Messages Sent</span>
          <span className="text-right">Conversion</span>
        </div>
        {chartData.leadsFunnelData.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-900">{item.name}</span>
            </div>
            <span className="text-right text-gray-600">{item.value}</span>
            <span className="text-right text-gray-600">
              {Math.round((item.value / chartData.leadsFunnelData.reduce((sum, d) => sum + d.value, 0)) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 