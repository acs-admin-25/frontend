import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

  // this is dead code


interface ConversationProgressionProps {
  leadData: any[];
  loading: boolean;
  timeRange: 'day' | 'week' | 'month' | 'year';
  onRefresh: () => Promise<void>;
}

interface MessageData {
  timestamp: string;
  evScore: number;
  conversationId: string;
}

interface Message {
  timestamp: string;
  ev_score: number | string;
}

const ConversationProgression: React.FC<ConversationProgressionProps> = ({ leadData, loading }) => {
  const [processedData, setProcessedData] = useState<MessageData[]>([]);

  useEffect(() => {
    if (!loading && leadData && Array.isArray(leadData)) {
      const data = processLeadData(leadData);
      setProcessedData(data);
    }
  }, [leadData, loading]);

  const processLeadData = (conversationsData: any[]): MessageData[] => {
    const allData: MessageData[] = [];

    conversationsData.forEach((conversation) => {
      const messages = conversation.messages || [];
      if (messages.length > 0) {
        // Use the first message's timestamp and a hash of the first message body as a stable ID
        const firstMessage = messages[0];
        const conversationId = firstMessage ? 
          `conv-${firstMessage.timestamp}-${firstMessage.body.slice(0, 8).split('').reduce((acc: number, char: string) => char.charCodeAt(0) + ((acc << 5) - acc), 0)}` :
          `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        
        messages.forEach((msg: Message) => {
          // Only process messages with ev_score
          if (msg.ev_score !== undefined) {
            const ev = typeof msg.ev_score === 'string' ? parseFloat(msg.ev_score) : msg.ev_score;
            if (typeof ev === 'number' && !isNaN(ev)) {
              allData.push({
                timestamp: msg.timestamp,
                evScore: ev,
                conversationId
              });
            }
          }
        });
      }
    });

    const sortedData = allData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return sortedData;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique conversation IDs
  const uniqueConversations = Array.from(new Set(processedData.map(d => d.conversationId)));

  return (
    <div className="bg-white p-6 rounded-lg border border-[#0e6537]/20 shadow-sm">
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
            title="You are viewing the Report Progression"
          >
            Generate Report
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#0e6537] to-[#157a42] text-white rounded-lg hover:from-[#157a42] hover:to-[#1a8a4a] transition-all duration-200 shadow-sm text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50"
            onClick={async () => {
              if (typeof window === 'undefined') return;
              const html2pdf = (await import('html2pdf.js')).default;
              const element = document.getElementById('conversation-progression-content');
              if (element) {
                html2pdf(element, {
                  margin: 10,
                  filename: 'conversation-progression.pdf',
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2 },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                });
              }
            }}
            title="Download the Conversation Progression as PDF"
          >
            Download PDF Report
          </button>
        </div>
      </div>
      <div id="conversation-progression-content">
        <h3 className="text-lg font-semibold mb-4">Conversation EV Score Progression</h3>
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-600">Loading progression data...</div>
        ) : processedData.length > 0 ? (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatDate}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, 100]}
                  label={{ value: 'EV Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={formatDate}
                  formatter={(value: number, name: string) => [`EV: ${value}`, name]}
                />
                <Legend />
                {uniqueConversations.map((conversationId, index) => (
                  <Line
                    key={conversationId}
                    type="monotone"
                    data={processedData.filter(d => d.conversationId === conversationId)}
                    dataKey="evScore"
                    name={`Conversation ${index + 1}`}
                    stroke={`hsl(${(index * 137.5) % 360}, 70%, 40%)`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-600">No progression data available.</div>
        )}
      </div>
    </div>
  );
};

export default ConversationProgression; 