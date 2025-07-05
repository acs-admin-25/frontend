'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import type { DashboardAnalytics } from '@/types/dashboard';

const ACS_COLORS = {
  primary: '#0A2F1F',
  secondary: '#2A5F4F',
  accent: ['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#9013FE'],
};

const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
    <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>
    <div style={{ width: '100%', height: 300 }}>
      {children}
    </div>
  </div>
);

export function DashboardCharts({ data }: { data: DashboardAnalytics }) {
  const conversationTrend = data.conversationTrend?.datasets[0]?.data.map((value, index) => ({
    name: data.conversationTrend.labels[index],
    conversations: value,
  }));

  const leadSourceBreakdown = data.leadSourceBreakdown?.labels.map((name, index) => ({
    name,
    value: data.leadSourceBreakdown.datasets[0].data[index],
  }));

  return (
    <div className="grid grid-cols-1 gap-8">
      <ChartCard title="Conversation Trend (Last 7 Days)">
        <ResponsiveContainer>
          <LineChart data={conversationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="conversations" stroke={ACS_COLORS.primary} strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      
      <ChartCard title="Lead Source Breakdown">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={leadSourceBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {leadSourceBreakdown?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ACS_COLORS.accent[index % ACS_COLORS.accent.length]} />
              ))}
            </Pie>
            <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
} 