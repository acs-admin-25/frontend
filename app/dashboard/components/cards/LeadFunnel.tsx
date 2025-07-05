/**
 * File: app/dashboard/components/LeadFunnel.tsx
 * Purpose: Renders a vertical bar chart visualization of the lead conversion funnel with interactive tooltips.
 * Author: Alejo Cagliolo
 * Date: 06/11/25
 * Version: 1.0.1
 */

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

  // this is dead code


/**
 * Interface for lead stage data structure
 * @interface LeadStage
 * @property {string} name - Name of the lead stage
 * @property {number} leads - Number of leads in this stage
 * @property {string} evRange - Engagement value range for this stage
 * @property {string} action - Recommended action for this stage
 */
interface LeadStage {
  name: string;
  leads: number;
  evRange: string;
  action: string;
}

/**
 * Props interface for LeadFunnel component
 * @interface LeadFunnelProps
 * @property {string | undefined} userId - ID of the current user
 * @property {any[]} leadData - Array of lead conversation data
 * @property {boolean} loading - Loading state indicator
 * @property {'day' | 'week' | 'month' | 'year'} timeRange - Selected time range for data
 * @property {Function} onRefresh - Callback function to refresh data
 */
interface LeadFunnelProps {
  userId: string | undefined;
  leadData: any[];
  loading: boolean;
  timeRange: 'day' | 'week' | 'month' | 'year';
  onRefresh: () => Promise<void>;
}

/**
 * LeadFunnel Component
 * Displays a vertical bar chart showing lead progression through different stages
 * 
 * Features:
 * - Responsive chart layout
 * - Dynamic height adjustment
 * - Interactive tooltips with detailed information
 * - Lead stage categorization
 * - Engagement value (EV) range tracking
 * - Recommended actions per stage
 * 
 * Stages:
 * - Contacted (EV: 0-19)
 * - Engaged (EV: 20-39)
 * - Toured (EV: 40-59)
 * - Offer Stage (EV: 60-79)
 * - Closed (EV: 80-100)
 * 
 * @param {LeadFunnelProps} props - Component props
 * @returns {JSX.Element} Vertical bar chart with lead funnel visualization
 */
const LeadFunnel: React.FC<LeadFunnelProps> = ({ userId, leadData, loading, timeRange, onRefresh }) => {
  const [categorizedData, setCategorizedData] = useState<LeadStage[]>([]);
  const [chartHeight, setChartHeight] = useState(300);

  useEffect(() => {
    // Adjust chart height based on screen size
    const updateChartHeight = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setChartHeight(250);
      } else if (window.innerWidth < 1024) { // lg breakpoint
        setChartHeight(300);
      } else {
        setChartHeight(350);
      }
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, []);

  useEffect(() => {
    if (!loading && leadData) {
      const data = categorizeLeads(leadData);
      setCategorizedData(data);
    } else if (!loading && !leadData) {
       setCategorizedData([]); // Handle case where leadData is null/undefined and not loading
    }
  }, [leadData, loading]);

  const categorizeLeads = (conversationsData: { thread: any; messages: any[] }[]): LeadStage[] => {
    const stages: Record<string, LeadStage> = {
      Contacted: { name: 'Contacted', leads: 0, evRange: '0-19', action: 'Initial outreach' },
      Engaged: { name: 'Engaged', leads: 0, evRange: '20-39', action: 'Follow-up' },
      Toured: { name: 'Toured', leads: 0, evRange: '40-59', action: 'Schedule tour' },
      'Offer Stage': { name: 'Offer Stage', leads: 0, evRange: '60-79', action: 'Prepare offer' },
      Closed: { name: 'Closed', leads: 0, evRange: '80-100', action: 'Finalize deal' },
    };

    conversationsData.forEach(({ messages }) => {
      let highestEv = -1;
      messages.forEach((message) => {
        const ev = typeof message.ev_score === 'string' ? parseFloat(message.ev_score) : message.ev_score;
        if (typeof ev === 'number' && !isNaN(ev)) {
          highestEv = Math.max(highestEv, ev);
        }
      });

      if (highestEv >= 0) {
        if (highestEv <= 19) stages.Contacted.leads++;
        else if (highestEv <= 39) stages.Engaged.leads++;
        else if (highestEv <= 59) stages.Toured.leads++;
        else if (highestEv <= 79) stages['Offer Stage'].leads++;
        else stages.Closed.leads++;
      }
    });

    return [
        stages.Contacted,
        stages.Engaged,
        stages.Toured,
        stages['Offer Stage'],
        stages.Closed,
    ].reverse();
  };

  // Custom tooltip component for better mobile display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-sm sm:text-base">{label}</p>
          <p className="text-xs sm:text-sm text-gray-600">Leads: {payload[0].value}</p>
          <p className="text-xs sm:text-sm text-gray-600">EV Range: {payload[0].payload.evRange}</p>
          <p className="text-xs sm:text-sm text-gray-600">Action: {payload[0].payload.action}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-[#0e6537]/20 shadow-sm">
      {/* Quick Actions */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-center">Quick Actions</h4>
        <div className="flex justify-center items-center gap-4 flex-wrap w-full mb-2">
          <button
            className="px-5 py-2 bg-gradient-to-r from-[#0e6537] to-[#157a42] text-white rounded-lg hover:from-[#157a42] hover:to-[#1a8a4a] transition-all duration-200 shadow text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50 border-2 border-[#0e6537]"
            style={{ boxShadow: '0 0 0 2px #0e6537' }}
            disabled
            title="You are viewing the Lead Journey"
          >
            Track Lead Journey
          </button>
          <button
            className="px-5 py-2 bg-gradient-to-r from-[#0e6537] to-[#157a42] text-white rounded-lg hover:from-[#157a42] hover:to-[#1a8a4a] transition-all duration-200 shadow text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('leadreport:generate-report');
                window.dispatchEvent(event);
              }
            }}
          >
            Generate Report
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#0e6537] to-[#157a42] text-white rounded-lg hover:from-[#157a42] hover:to-[#1a8a4a] transition-all duration-200 shadow-sm text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50"
            onClick={async () => {
              if (typeof window === 'undefined') return;
              const html2pdf = (await import('html2pdf.js')).default;
              const element = document.getElementById('lead-funnel-content');
              if (element) {
                html2pdf(element, {
                  margin: 10,
                  filename: 'lead-journey-funnel.pdf',
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2 },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                });
              }
            }}
            title="Download the Lead Journey Funnel as PDF"
          >
            Download PDF Report
          </button>
        </div>
      </div>
      <div id="lead-funnel-content">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Lead Journey Funnel</h3>
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64 text-gray-600 text-sm sm:text-base">
            Loading funnel data...
          </div>
        ) : categorizedData.length === 0 ? (
          <div className="flex items-center justify-center h-48 sm:h-64 text-gray-600 text-sm sm:text-base">
            No lead data found.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart 
                data={categorizedData} 
                layout="vertical" 
                barCategoryGap="20%"
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[0, 'auto']} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="leads" 
                  fill="#0e6537"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadFunnel;

/**
 * Change Log:
 * 06/11/25 - Version 1.0.1
 * - Enhanced mobile responsiveness
 * - Improved tooltip display
 * - Added comprehensive documentation
 * - Optimized chart performance
 * 
 * 5/25/25 - Version 1.0.0
 * - Initial implementation
 * - Basic funnel visualization
 * - Lead stage categorization
 * - Interactive tooltips
 */ 