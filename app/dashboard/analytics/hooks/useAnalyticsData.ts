// 'use client';

// import { useState, useEffect } from 'react';

// // Mock data based on the original component
// const mockData = {
//   keyMetrics: [
//     { title: 'Total Leads', value: '1,234', trend: '+12.5%', trendDirection: 'up' as const },
//     { title: 'Conversion Rate', value: '23.5%', trend: '+2.1%', trendDirection: 'up' as const },
//     { title: 'Avg. Response Time', value: '12m', trend: '-3m', trendDirection: 'up' as const },
//     { title: 'Active Leads', value: '47', trend: '+12 this week', trendDirection: 'up' as const },
//   ],
//   leadSources: [
//     { source: 'Website Forms', percentage: 45 },
//     { source: 'Social Media', percentage: 28 },
//     { source: 'Referrals', percentage: 18 },
//     { source: 'Open Houses', percentage: 12 },
//   ],
//   conversionTrends: [
//     { month: "Jan", conversion: 18, leads: 32 },
//     { month: "Feb", conversion: 20, leads: 38 },
//     { month: "Mar", conversion: 22, leads: 41 },
//     { month: "Apr", conversion: 23.5, leads: 47 },
//   ],
// };

// export function useAnalyticsData(dateRange: string = '30d') {
//   const [data, setData] = useState<typeof mockData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     setLoading(true);
//     // In a real app, you would fetch data based on the dateRange
//     // e.g., using the useApi hook:
//     // const { data, loading, error } = useApi(`/api/analytics?range=${dateRange}`);
//     setTimeout(() => {
//       setData(mockData);
//       setLoading(false);
//     }, 1000); // Simulate network delay
//   }, [dateRange]);

//   return { data, loading, error };
// } 