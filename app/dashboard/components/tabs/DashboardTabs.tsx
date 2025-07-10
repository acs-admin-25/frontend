import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils/utils'
import { ConversationsTab } from './ConversationsTab'
import { AnalyticsTab } from './AnalyticsTab'
import { UsageTab } from './UsageTab'
import { ResourcesTab } from './ResourcesTab'
import { FilterButton } from '../FilterButton'

// Import the actual tab components
import type { Conversation } from '@/lib/types/conversation';

// Date range options
export type DateRange = '24h' | '7d' | '30d' | '3m' | '6m' | '1y';

export function DashboardTabs({ className, conversations }: { className?: string; conversations?: Conversation[] }) {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('30d');

  // Add CSS for hiding scrollbar
  const scrollbarHideStyle = `
    .filter-dropdown::-webkit-scrollbar {
      display: none;
    }
  `;

  const baseTabTriggerClasses = cn(
    "flex-1 text-lg px-6 py-3 h-full rounded-t-lg font-semibold",
    "transition-colors duration-200",
    "data-[state=active]:bg-[#288e41] data-[state=active]:text-white",
    "data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-[#288e41]/40 data-[state=inactive]:hover:text-black",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Added focus styles for accessibility
  )

  return (
    <div className={cn("w-full mt-4 px-4 sm:px-6", className)}>
      <style>{scrollbarHideStyle}</style>
      <Tabs defaultValue="conversations" className="w-full">
        <div className="flex items-center justify-between border-b border-border">
          {" "}
          {/* Softer bottom border */}
          <TabsList className="flex bg-transparent p-0 gap-0 h-12 flex-1">
            {" "}
            {/* Removed vertical borders */}
            <TabsTrigger value="conversations" className={baseTabTriggerClasses}>
              Conversations
            </TabsTrigger>
            <TabsTrigger value="analytics" className={baseTabTriggerClasses}>
              Analytics
            </TabsTrigger>
            <TabsTrigger value="usage" className={baseTabTriggerClasses}>
              Usage
            </TabsTrigger>
            <TabsTrigger value="resources" className={baseTabTriggerClasses}>
              Resources
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {/* Comprehensive Filter Button */}
            <FilterButton 
              selectedDateRange={selectedDateRange} 
              onDateRangeChange={setSelectedDateRange}
            />
          </div>
        </div>
        <TabsContent value="conversations">
          <ConversationsTab conversations={conversations} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab selectedDateRange={selectedDateRange} />
        </TabsContent>
        <TabsContent value="usage">
          <UsageTab />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DashboardTabs
