import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';


  // this is dead code

interface LeadReportProps {
  userId: string | undefined;
  leadData: any[];
  loading: boolean;
  timeRange: 'day' | 'week' | 'month' | 'year';
  onRefresh: () => Promise<void>;
}

interface LeadData {
  totalLeads: number;
  newLeads: number;
  leadsByStage: { name: string; count: number; evRange: string }[];
  aiInsights: { hotLeads: string[]; followUps: string[]; predictions: string[] };
  dailyLeadGrowth: { day: string; count: number }[];
  performanceSummary: { avgCloseTime: string; sourceBreakdown: { source: string; count: number }[] };
}

interface Message {
  ev_score?: number | string;
  timestamp: string;
  [key: string]: any;
}

const getTimeRangeDays = (timeRange: 'day' | 'week' | 'month' | 'year') => {
  switch (timeRange) {
    case 'day':
      return 1;
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'year':
      return 365;
    default:
      return 1;
  }
};

const processLeadDataForReport = (conversationsData: any[], timeRange: 'day' | 'week' | 'month' | 'year'): LeadData => {
  const totalLeads = conversationsData.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyCounts: Record<string, number> = {};
  let newLeads = 0;

  // Calculate the start date based on timeRange
  const days = getTimeRangeDays(timeRange);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1));

  conversationsData.forEach(({ messages }) => {
    if (messages.length > 0) {
      const firstMessageTimestamp = new Date(messages[0].timestamp);
      firstMessageTimestamp.setHours(0, 0, 0, 0);

      if (firstMessageTimestamp >= startDate && firstMessageTimestamp <= today) {
        newLeads++;
        const dateKey = firstMessageTimestamp.toISOString().split('T')[0];
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      }
    }
  });

  // Generate dailyLeadGrowth array based on timeRange
  const dailyLeadGrowth: { day: string; count: number }[] = [];
  const daysToShow = days;
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
    const dateKey = date.toISOString().split('T')[0];
    dailyLeadGrowth.push({ day: dayOfWeek, count: dailyCounts[dateKey] || 0 });
  }

  // Rest of your existing processing logic...
  const leadsByStage = [
    { name: 'Contacted', count: 0, evRange: '0-19' },
    { name: 'Engaged', count: 0, evRange: '20-39' },
    { name: 'Toured', count: 0, evRange: '40-59' },
    { name: 'Offer Stage', count: 0, evRange: '60-79' },
    { name: 'Closed', count: 0, evRange: '80-100' },
  ];

  conversationsData.forEach(({ messages }) => {
    let highestEv = -1;
    messages.forEach((message: Message) => {
      const ev = typeof message.ev_score === 'string' ? parseFloat(message.ev_score) : message.ev_score;
      if (typeof ev === 'number' && !isNaN(ev)) {
        highestEv = Math.max(highestEv, ev);
      }
    });

    if (highestEv >= 0) {
      if (highestEv <= 19) leadsByStage[0].count++;
      else if (highestEv <= 39) leadsByStage[1].count++;
      else if (highestEv <= 59) leadsByStage[2].count++;
      else if (highestEv <= 79) leadsByStage[3].count++;
      else leadsByStage[4].count++;
    }
  });

  const aiInsights = {
    hotLeads: ['Lead A (EV 85)', 'Lead B (EV 90)'],
    followUps: ['Lead C (Last contact 3 days ago)', 'Lead D (No response)'],
    predictions: ['Lead E likely to close soon']
  };

  const performanceSummary = { avgCloseTime: 'N/A', sourceBreakdown: [] };

  return {
    totalLeads,
    newLeads,
    leadsByStage,
    aiInsights,
    dailyLeadGrowth,
    performanceSummary,
  };
};

// Helper to get interval config based on timeRange
const getIntervalConfig = (timeRange: 'day' | 'week' | 'month' | 'year') => {
  switch (timeRange) {
    case 'day':
      return { interval: 3, unit: 'hour', ticks: 8, format: 'ha' };
    case 'week':
      return { interval: 1, unit: 'day', ticks: 7, format: 'EEE' };
    case 'month':
      return { interval: 3, unit: 'day', ticks: 10, format: 'MMM d' };
    case 'year':
      return { interval: 1, unit: 'month', ticks: 12, format: 'MMM' };
    default:
      return { interval: 2, unit: 'hour', ticks: 12, format: 'ha' };
  }
};

// Helper to add time
const addTime = (date: Date, amount: number, unit: string) => {
  const d = new Date(date);
  switch (unit) {
    case 'hour': d.setHours(d.getHours() + amount); break;
    case 'day': d.setDate(d.getDate() + amount); break;
    case 'month': d.setMonth(d.getMonth() + amount); break;
    default: break;
  }
  return d;
};

// Helper to format date
const formatTick = (date: Date, format: string) => {
  if (format === 'ha') return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  if (format === 'EEE') return date.toLocaleDateString('en-US', { weekday: 'short' });
  if (format === 'MMM d') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (format === 'MMM') return date.toLocaleDateString('en-US', { month: 'short' });
  return date.toLocaleDateString();
};

// Aggregates lead growth data by interval
const aggregateLeadGrowth = (conversationsData: any[], timeRange: 'day' | 'week' | 'month' | 'year') => {
  type Interval = {
    start: Date;
    end: Date;
    label: string;
    count: number;
    raw: any[];
  };
  const config = getIntervalConfig(timeRange);
  const now = new Date();
  let start: Date;
  if (timeRange === 'day') {
    start = new Date(now); start.setHours(0, 0, 0, 0);
  } else if (timeRange === 'week') {
    start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0);
  } else if (timeRange === 'month') {
    start = new Date(now); start.setDate(now.getDate() - 29); start.setHours(0, 0, 0, 0);
  } else {
    start = new Date(now); start.setMonth(now.getMonth() - 11); start.setDate(1); start.setHours(0, 0, 0, 0);
  }
  const intervals: Interval[] = [];
  let cursor = new Date(start);
  for (let i = 0; i < config.ticks; i++) {
    intervals.push({
      start: new Date(cursor),
      end: addTime(cursor, config.interval, config.unit),
      label: formatTick(cursor, config.format),
      count: 0,
      raw: [],
    });
    cursor = addTime(cursor, config.interval, config.unit);
  }
  // Count leads in each interval
  conversationsData.forEach(({ messages }) => {
    if (messages.length > 0) {
      const firstMsg = messages[0];
      const ts = new Date(firstMsg.timestamp);
      for (let i = 0; i < intervals.length; i++) {
        if (ts >= intervals[i].start && ts < intervals[i].end) {
          intervals[i].count++;
          intervals[i].raw.push(firstMsg);
          break;
        }
      }
    }
  });
  return intervals;
};

const LeadReport: React.FC<LeadReportProps> = ({ userId, leadData, loading, timeRange, onRefresh }) => {
  const processedReportData = useMemo(() => {
    if (!loading && leadData && Array.isArray(leadData)) {
      return processLeadDataForReport(leadData, timeRange);
    }
    return null;
  }, [leadData, loading, timeRange]);

  // New: aggregate lead growth for chart
  const leadGrowthIntervals = useMemo(() => {
    if (!loading && leadData && Array.isArray(leadData)) {
      return aggregateLeadGrowth(leadData, timeRange);
    }
    return [];
  }, [leadData, loading, timeRange]);

  const config = getIntervalConfig(timeRange);

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'day':
        return 'Last 24 Hours';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'year':
        return 'Last 12 Months';
      default:
        return 'Last 24 Hours';
    }
  };

  const handleDownloadReport = async () => {
    if (typeof window === 'undefined') {
      console.warn('html2pdf.js can only run in the browser.');
      return;
    }
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('lead-report-content');
    if (element) {
      html2pdf(element, {
        margin: 10,
        filename: 'lead-performance-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-[#0e6537]/20 shadow-sm" id="lead-report-content">
      {/* Quick Actions */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-center">Quick Actions</h4>
        <div className="flex justify-center items-center gap-4 flex-wrap w-full mb-2">
          <button
            className="px-5 py-2 bg-gradient-to-r from-[#0e6537] to-[#157a42] text-white rounded-lg hover:from-[#157a42] hover:to-[#1a8a4a] transition-all duration-200 shadow text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('leadreport:track-journey');
                window.dispatchEvent(event);
              }
            }}
          >
            Track Lead Journey
          </button>
          <button
            className="px-5 py-2 bg-gradient-to-r from-[#0e6537] to-[#157a42] text-white rounded-lg hover:from-[#157a42] hover:to-[#1a8a4a] transition-all duration-200 shadow text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50 border-2 border-[#0e6537]"
            style={{ boxShadow: '0 0 0 2px #0e6537' }}
            disabled
            title="You are viewing the Report"
          >
            Generate Report
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#0e6537] to-[#157a42] text-white rounded-lg hover:from-[#157a42] hover:to-[#1a8a4a] transition-all duration-200 shadow-sm text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50"
            onClick={handleDownloadReport}
          >
            Download PDF Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600">Loading report data...</div>
      ) : processedReportData ? (
        <div>
          {/* Leads per EV Stage - Only show number ranges as labels */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Leads by Engagement Value (EV) Stage</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={processedReportData.leadsByStage} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="count" tick={{ fontSize: 13 }} />
                <YAxis type="category" dataKey="evRange" width={80} tick={{ fontSize: 14 }} />
                <Tooltip formatter={(value: number, name: string, props: any) => [`${value} leads`, `EV Range: ${props.payload.evRange}`]} />
                <Bar dataKey="count" fill="#0e6537" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Growth Chart with Intervals */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Lead Growth {getTimeRangeText()}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={leadGrowthIntervals} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label"
                  interval={0}
                  ticks={leadGrowthIntervals.map(i => i.label)}
                  tickFormatter={(label) => label}
                  tick={{ fontSize: 13 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                <Tooltip 
                  labelFormatter={(label: string, payload: any[]) => {
                    const d = leadGrowthIntervals.find(i => i.label === label);
                    if (!d) return '';
                    if (timeRange === 'day') {
                      return `${d.start.toLocaleDateString()} ${d.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${d.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    } else if (timeRange === 'week' || timeRange === 'month') {
                      return `${d.start.toLocaleDateString()} - ${d.end.toLocaleDateString()}`;
                    } else {
                      return `${d.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
                    }
                  }}
                  formatter={(value: any) => [`${value} leads`, 'Leads']}
                />
                <Line type="monotone" dataKey="count" stroke="#0e6537" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-600">No data available.</div>
      )}
    </div>
  );
};

export default LeadReport; 