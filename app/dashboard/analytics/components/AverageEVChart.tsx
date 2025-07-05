/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This component is exported but never imported or used in the application.
 * It appears to be legacy EV chart functionality that was never integrated.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils/utils';
import type { EVDataPoint, ChartConfig } from '@/types/analytics';

interface AverageEVChartProps {
  data: EVDataPoint[];
  config?: ChartConfig;
  className?: string;
  title?: string;
  description?: string;
}

export function AverageEVChart({ 
  data, 
  config = {}, 
  className,
  title = "Average EV Score by Message",
  description = "Shows the average engagement value score for each message in conversations"
}: AverageEVChartProps) {
  const {
    height = 400,
    colors = ['#3b82f6', '#10b981'],
    showGrid = true,
    showLegend = true,
    responsive = true
  } = config;

  if (!data || data.length === 0) {
    return (
      <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
        <div className="text-center py-8">
          <p className="text-gray-500">No EV data available</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    message: `Message ${item.messageNumber}`,
    averageEV: Number(item.averageEV.toFixed(2)),
    conversationCount: item.conversationCount,
    totalMessages: item.totalMessages
  }));

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="space-y-6">
        {/* Line Chart for Average EV */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Average EV Score Trend</h4>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey="message" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Average EV Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [value.toFixed(2), 'Average EV']}
                labelFormatter={(label) => `${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="averageEV" 
                stroke={colors[0]} 
                strokeWidth={3}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart for Conversation Count */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Conversations per Message</h4>
          <ResponsiveContainer width="100%" height={height * 0.6}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey="message" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Conversation Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [value, 'Conversations']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey="conversationCount" 
                fill={colors[1]} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {data.length > 0 ? data[0].averageEV.toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600">First Message Avg EV</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {data.length > 0 ? data[data.length - 1].averageEV.toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600">Latest Message Avg EV</p>
          </div>
        </div>
      </div>
    </div>
  );
} 