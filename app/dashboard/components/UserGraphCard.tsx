import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Conversation } from '@/types/conversation';
import { DateRange } from '../tabs/DashboardTabs';
import { generateChartData } from '@/lib/utils/analytics';

interface UserGraphCardProps {
  conversations: Conversation[];
  selectedDateRange: DateRange;
}

export function UserGraphCard({ conversations, selectedDateRange }: UserGraphCardProps) {
  const chartData = generateChartData(conversations, selectedDateRange);

  return (
    <div className="lg:col-span-2 border border-gray-300 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">User Overview</h3>
        <div className="text-sm text-gray-500">
          Last {selectedDateRange === '24h' ? '24 Hours' : 
                selectedDateRange === '7d' ? '7 Days' : 
                selectedDateRange === '30d' ? '30 Days' : 
                selectedDateRange === '3m' ? '3 Months' : 
                selectedDateRange === '6m' ? '6 Months' : '1 Year'}
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.userOverviewData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                if (selectedDateRange === '24h') {
                  return value.split(" ")[1]; // Show only time for 24h
                }
                return value.split(" ")[1]; // Show day for other ranges
              }}
              stroke="#64748b"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              interval={selectedDateRange === '24h' ? 3 : 'preserveStartEnd'}
            />
            <YAxis
              domain={[0, 'dataMax + 2']}
              ticks={[0, 5, 10, 15, 20, 25, 30]}
              tickFormatter={(value) => value.toString()}
              stroke="#64748b"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Conversations', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Area type="monotone" dataKey="users" stroke="#22c55e" fill="url(#colorUsers)" strokeWidth={2} />
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 