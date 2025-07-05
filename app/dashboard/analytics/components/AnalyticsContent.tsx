// /**
//  * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
//  * 
//  * This component is exported but never imported or used in the application.
//  * The main analytics page (app/dashboard/analytics/page.tsx) has its own
//  * AnalyticsContent function defined inline and doesn't use this component.
//  * 
//  * This component is trying to import from a non-existent path:
//  * '@/app/dashboard/analytics/nothing/AnalyticsContext'
//  * 
//  * TODO: Remove this file if no longer needed
//  * 
//  * Last checked: 2025-01-XX
//  * Status: Safe to delete
//  */

// 'use client';

// import React from 'react';
// import { cn } from '@/lib/utils';
// import { useAnalytics } from '@/app/dashboard/analytics/nothing/AnalyticsContext';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { DataTable } from '@/components/features/dashboard/DataTable';
// import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
// import { 
//   LeadsMetricCard, 
//   ConversionMetricCard, 
//   ResponseTimeMetricCard,
//   GrowthMetricCard 
// } from '@/components/features/dashboard/MetricsCard';
// import { 
//   BarChart3, 
//   RefreshCw,
//   Filter,
//   Search,
//   Calendar
// } from "lucide-react";

// interface AnalyticsContentProps {
//   className?: string;
//   showMetrics?: boolean;
//   showCharts?: boolean;
//   showTable?: boolean;
//   layout?: 'grid' | 'stacked';
// }

// export function AnalyticsContent({ 
//   className,
//   showMetrics = true,
//   showCharts = true,
//   showTable = true,
//   layout = 'grid'
// }: AnalyticsContentProps) {
//   const { 
//     data, 
//     loading, 
//     error, 
//     refetch,
//     filters,
//     updateFilters 
//   } = useAnalytics();

//   if (loading) {
//     return (
//       <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
//         <LoadingSpinner size="lg" text="Loading analytics..." />
//       </div>
//     );
//   }

//   if (error || !data) {
//     return (
//       <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
//         <Card className="p-8 text-center max-w-md">
//           <div className="text-red-500 mb-4">
//             <BarChart3 className="w-12 h-12 mx-auto" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Analytics</h2>
//           <p className="text-gray-600 mb-6">{error || 'An unexpected error occurred.'}</p>
//           <Button onClick={() => refetch()} className="w-full">
//             <RefreshCw className="w-4 h-4 mr-2" />
//             Try Again
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   // Calculate real metrics from the data
//   const totalLeads = data.conversations.length;
//   const completedConversations = data.conversations.filter(conv => conv.thread.completed).length;
//   const conversionRate = totalLeads > 0 ? Math.round((completedConversations / totalLeads) * 100) : 0;
//   const activeConversations = data.conversations.filter(conv => !conv.thread.completed).length;
  
//   // Calculate average response time (placeholder - would need real data)
//   const averageResponseTime = totalLeads > 0 ? Math.round(Math.random() * 20 + 5) : 0;
  
//   // Calculate growth (placeholder - would need historical data)
//   const growthRate = 12.5; // This would be calculated from historical data

//     return (
//     <div className={cn("space-y-8", className)}>
//       {/* Header Section */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
//           <p className="text-gray-600 mt-1">Comprehensive insights into your lead performance</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <Button variant="outline" size="sm">
//             <Calendar className="w-4 h-4 mr-2" />
//             {filters.dateRange === '7d' ? '7 Days' : 
//              filters.dateRange === '30d' ? '30 Days' : 
//              filters.dateRange === '90d' ? '90 Days' : 'All Time'}
//           </Button>
//           <Button variant="outline" size="sm" onClick={() => refetch()}>
//             <RefreshCw className="w-4 h-4 mr-2" />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Key Metrics Grid - Using real data from context */}
//       {showMetrics && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <LeadsMetricCard 
//             value={totalLeads}
//             trend={growthRate}
//             trendLabel="last month"
//           />
//           <ConversionMetricCard 
//             value={`${conversionRate}%`}
//             trend={2.1}
//             trendLabel="last month"
//           />
//           <ResponseTimeMetricCard 
//             value={`${averageResponseTime}m`}
//             trend={-5}
//             trendLabel="last week"
//           />
//           <GrowthMetricCard 
//             value={activeConversations}
//             trend={8.3}
//             trendLabel="last month"
//           />
//         </div>
//       )}

//       {/* Analytics Tabs */}
//       {showCharts && (
//         <Tabs defaultValue="overview" className="space-y-6">
//           <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
//             <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
//               Overview
//             </TabsTrigger>
//             <TabsTrigger value="conversations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
//               Conversations
//             </TabsTrigger>
//             <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
//               Performance
//             </TabsTrigger>
//             <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
//               Insights
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="overview" className="space-y-6">
//             {/* Charts Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* EV by Message Chart - Using real data */}
//               <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-lg font-semibold text-gray-900">EV Score by Message</h3>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//                     <span className="text-sm text-gray-600">Average EV</span>
//                   </div>
//                 </div>
//                 <div className="h-64 flex items-center justify-center">
//                   {data.evByMessage && data.evByMessage.length > 0 ? (
//                     <div className="w-full h-full flex items-end justify-between space-x-2">
//                       {data.evByMessage.slice(0, 8).map((point, index) => (
//                         <div key={index} className="flex-1 flex flex-col items-center">
//                           <div 
//                             className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
//                             style={{ height: `${Math.max(point.averageEV * 20, 10)}%` }}
//                           ></div>
//                           <span className="text-xs text-gray-600 mt-2">{point.messageNumber}</span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-gray-500 text-center">
//                       <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                       <p>No EV data available</p>
//                     </div>
//                   )}
//                 </div>
//               </Card>

//               {/* Lead Source Performance - Using real data */}
//               <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Source Performance</h3>
//                 <div className="space-y-4">
//                   {data.conversations && data.conversations.length > 0 ? (
//                     data.conversations.slice(0, 5).map((conv, index) => (
//                       <div key={index} className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <div className={`w-3 h-3 rounded-full ${
//                             index === 0 ? 'bg-green-500' :
//                             index === 1 ? 'bg-blue-500' :
//                             index === 2 ? 'bg-yellow-500' :
//                             index === 3 ? 'bg-purple-500' : 'bg-gray-500'
//                           }`}></div>
//                           <span className="text-sm font-medium text-gray-900">
//                             {conv.thread.source_name || 'Unknown Source'}
//                           </span>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm font-semibold text-gray-900">
//                             {conv.thread.aiScore ? `${(conv.thread.aiScore * 100).toFixed(1)}%` : 'N/A'}
//                           </p>
//                           <p className="text-xs text-gray-500">EV Score</p>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-gray-500 text-center py-8">
//                       <p>No conversation data available</p>
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             </div>
//           </TabsContent>

//           <TabsContent value="conversations" className="space-y-6">
//             {showTable && (
//               <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
//                 <div className="p-6">
//                   <div className="flex items-center justify-between mb-6">
//                     <h3 className="text-lg font-semibold text-gray-900">All Conversations</h3>
//                     <div className="flex items-center space-x-3">
//                       <Button variant="outline" size="sm">
//                         <Filter className="w-4 h-4 mr-2" />
//                         Filter
//                       </Button>
//                       <Button variant="outline" size="sm">
//                         <Search className="w-4 h-4 mr-2" />
//                         Search
//                       </Button>
//                     </div>
//                   </div>
//                   <DataTable
//                     conversations={data.conversations}
//                     loading={loading}
//                     error={error}
//                     onRefresh={refetch}
//                     title=""
//                     emptyMessage="No conversations found"
//                     showFilters={true}
//                     showSearch={true}
//             />
//           </div>
//               </Card>
//             )}
//           </TabsContent>

//           <TabsContent value="performance" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Time Analysis</h3>
//                 <div className="h-64 flex items-center justify-center text-gray-500">
//                   <div className="text-center">
//                     <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                     <p>Response time chart coming soon</p>
//                   </div>
//                 </div>
//               </Card>

//               <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
//                 <div className="h-64 flex items-center justify-center text-gray-500">
//                   <div className="text-center">
//                     <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                     <p>Conversion funnel chart coming soon</p>
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </TabsContent>

//           <TabsContent value="insights" className="space-y-6">
//             <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                     <h4 className="font-semibold text-green-800 mb-2">Total Conversations</h4>
//                     <p className="text-green-700 text-sm">You have {totalLeads} total conversations in your system.</p>
//                   </div>
//                   <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <h4 className="font-semibold text-blue-800 mb-2">Conversion Rate</h4>
//                     <p className="text-blue-700 text-sm">Your current conversion rate is {conversionRate}%.</p>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//                     <h4 className="font-semibold text-yellow-800 mb-2">Active Conversations</h4>
//                     <p className="text-yellow-700 text-sm">You have {activeConversations} active conversations.</p>
//                   </div>
//                   <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
//                     <h4 className="font-semibold text-purple-800 mb-2">Data Coverage</h4>
//                     <p className="text-purple-700 text-sm">Showing data for {filters.dateRange} time period.</p>
//                   </div>
//                 </div>
//         </div>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       )}

//       {/* Empty State */}
//       {(!showMetrics || totalLeads === 0) && 
//        (!showCharts || !data.evByMessage || data.evByMessage.length === 0) && (
//         <div className="text-center py-12">
//           <div className="max-w-md mx-auto">
//             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <BarChart3 className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
//             <p className="text-gray-600">
//               There's no analytics data available for the selected filters. Try adjusting your filters or check back later.
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// } 