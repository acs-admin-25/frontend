import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils/utils';

// Placeholder components for each tab (to be implemented separately)
function ConversationsTab() {
  return <div className="p-6">Conversations content goes here.</div>;
}
function AnalyticsTab() {
  return <div className="p-6">Analytics content goes here.</div>;
}
function UsageTab() {
  return <div className="p-6">Usage content goes here.</div>;
}
function ResourcesTab() {
  return <div className="p-6">Resources content goes here.</div>;
}

export function DashboardTabs({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-screen-2xl mx-auto mt-4',
        'pl-0 md:pl-8', // match left padding of dashboard grid
        className
      )}
    >
      <Tabs defaultValue="conversations" className="w-full max-w-3xl">
        <TabsList
          className={cn(
            'mb-2 flex justify-start bg-card p-2 rounded-xl gap-2 shadow-lg',
            'min-w-[320px] max-w-full',
            'border border-border',
            'h-16'
          )}
        >
          <TabsTrigger
            value="conversations"
            className={cn(
              'text-lg px-8 py-3 h-12',
              'data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]',
              'transition-colors duration-200',
              'font-semibold'
            )}
          >
            Conversations
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className={cn(
              'text-lg px-8 py-3 h-12',
              'data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]',
              'transition-colors duration-200',
              'font-semibold'
            )}
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className={cn(
              'text-lg px-8 py-3 h-12',
              'data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]',
              'transition-colors duration-200',
              'font-semibold'
            )}
          >
            Usage
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className={cn(
              'text-lg px-8 py-3 h-12',
              'data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]',
              'transition-colors duration-200',
              'font-semibold'
            )}
          >
            Resources
          </TabsTrigger>
        </TabsList>
        <TabsContent value="conversations">
          <ConversationsTab />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="usage">
          <UsageTab />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DashboardTabs; 