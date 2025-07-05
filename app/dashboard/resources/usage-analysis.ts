import { ResourceSection } from '../../../types/resources';

export const usageAnalyticsSection: ResourceSection = {
  id: "usage-analytics",
  title: "Usage & Analytics",
  description: "Monitor your usage and optimize performance",
  colorScheme: "from-indigo-500 to-blue-500",
  icon: "TrendingUp",
  content: [
    {
      title: "Usage Dashboard",
      description: "Track your AI usage and system performance",
      details: [
        "API Calls: Monitor daily and monthly API usage",
        "Token Tracking: Track AI token consumption",
        "Conversation Counts: Monitor conversation volume",
        "Performance Metrics: Response times and system efficiency"
      ],
      tips: [
        "Monitor usage to stay within limits",
        "Optimize conversations for efficiency",
        "Review performance metrics regularly"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Usage Review",
          description: "Weekly review of system usage and performance",
          clientAction: "Open Usage tab and review current metrics",
          systemResponse: "Display usage statistics and performance data",
          expectedOutcome: "Understanding of system usage patterns and costs",
          timeEstimate: "5-10 minutes"
        }
      ],
      interactiveElements: [
        {
          name: "Usage Charts",
          location: "Usage dashboard",
          purpose: "Visual representation of usage trends",
          howToUse: "Review charts to understand usage patterns",
          bestPractices: ["Monitor daily trends", "Compare weekly usage", "Set usage alerts"]
        }
      ]
    },
    {
      title: "Billing & Optimization",
      description: "Understanding costs and optimizing usage",
      details: [
        "Usage-Based Billing: Pay only for what you use",
        "Cost Efficiency: Optimize usage for better value",
        "Billing Alerts: Get notified of usage thresholds",
        "Usage Reports: Detailed breakdown of costs"
      ],
      tips: [
        "Set up billing alerts to avoid surprises",
        "Review usage patterns for optimization",
        "Consider usage trends for planning"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Billing Review",
          description: "Monthly review of billing and usage costs",
          clientAction: "Check Usage → Billing section",
          systemResponse: "Display current billing status and usage breakdown",
          expectedOutcome: "Clear understanding of costs and optimization opportunities",
          timeEstimate: "5-10 minutes"
        }
      ]
    },
    {
      title: "Performance Analytics",
      description: "Track key performance indicators",
      details: [
        "Response Times: Monitor system and AI response speed",
        "Conversion Rates: Track lead to client conversion",
        "Lead Sources: Identify most effective lead channels",
        "Trend Analysis: Long-term performance tracking"
      ],
      tips: [
        "Focus on improving conversion rates",
        "Identify and optimize top lead sources",
        "Use trends to predict future performance"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Performance Review",
          description: "Weekly review of key performance metrics",
          clientAction: "Open Analytics tab and review conversion data",
          systemResponse: "Display performance metrics and trend analysis",
          expectedOutcome: "Understanding of business performance and optimization opportunities",
          timeEstimate: "10-15 minutes"
        }
      ],
      interactiveElements: [
        {
          name: "Performance Charts",
          location: "Analytics dashboard",
          purpose: "Visual performance tracking and trend analysis",
          howToUse: "Review charts to identify performance patterns",
          bestPractices: ["Focus on conversion trends", "Monitor lead source effectiveness", "Track response time improvements"]
        }
      ]
    }
  ]
};
