import React, { useState } from 'react';
import { RecentConversations } from '../cards/RecentConversations';
import LeadReport from '../cards/LeadReport';
import ConversationProgression from '../cards/ConversationProgression';
import type { Conversation } from '@/lib/types/conversation';

interface ConversationsTabProps {
  conversations?: Conversation[];
}

export function ConversationsTab({ conversations = [] }: ConversationsTabProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Recent Conversations */}
      <div className="col-span-12 lg:col-span-7">
        <RecentConversations conversations={conversations} />
      </div>
      
      {/* Right Column - Lead Reports */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <LeadReport 
          userId={undefined}
          leadData={conversations}
          loading={false}
          timeRange={timeRange}
          onRefresh={async () => {}}
        />
        <ConversationProgression 
          leadData={conversations}
          loading={false}
          timeRange={timeRange}
          onRefresh={async () => {}}
        />
      </div>
    </div>
  );
}

export default ConversationsTab; 