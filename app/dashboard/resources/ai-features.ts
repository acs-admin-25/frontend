import { ResourceSection } from '../../../types/resources';

export const aiFeaturesSection: ResourceSection = {
  id: "ai-features",
  title: "AI Features & Insights",
  description: "Leverage artificial intelligence to improve your real estate business",
  colorScheme: "from-purple-500 to-pink-500",
  icon: "Sparkles",
  content: [
    {
      title: "AI-Powered Lead Scoring",
      description: "Intelligent lead evaluation and prioritization",
      details: [
        "EV scores (0-100) help prioritize leads effectively",
        "Hot leads (80+): High engagement and conversion potential",
        "Warm leads (60-79): Moderate interest requiring follow-up",
        "Cold leads (<60): Low engagement, may need different approach"
      ],
      tips: [
        "Focus your efforts on hot and warm leads",
        "Review cold leads periodically for potential reactivation",
        "Use score trends to identify improving or declining leads"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Score Review",
          description: "Daily review of lead engagement scores",
          clientAction: "Open Conversations tab and sort by EV score",
          systemResponse: "Display leads with current engagement scores",
          expectedOutcome: "Clear prioritization of daily activities",
          timeEstimate: "5-10 minutes"
        },
        {
          step: 2,
          title: "Score Analysis",
          description: "Understanding why leads have specific scores",
          clientAction: "Click on leads to review conversation history",
          systemResponse: "Show detailed conversation analysis and AI insights",
          expectedOutcome: "Understanding of lead engagement patterns",
          timeEstimate: "3-5 minutes per lead"
        }
      ],
      interactiveElements: [
        {
          name: "Score Visualization",
          location: "Lead cards and conversation list",
          purpose: "Visual representation of engagement scores",
          howToUse: "Look for colored score indicators on lead cards",
          bestPractices: ["Green (80+) = Hot leads", "Yellow (60-79) = Warm leads", "Red (<60) = Cold leads"]
        },
        {
          name: "Score Trends",
          location: "Lead detail view",
          purpose: "Track score changes over time",
          howToUse: "Review score history in lead profile",
          bestPractices: ["Monitor improving scores", "Identify declining engagement", "Use trends for follow-up timing"]
        }
      ]
    },
    {
      title: "AI Insights & Analysis",
      description: "Deep understanding of client needs and preferences",
      details: [
        "Client Need Summaries: Budget, property types, timeline analysis",
        "Conversation Analysis: Message content and engagement tracking",
        "Response Quality Feedback: AI suggestions for better communication",
        "Automated Suggestions: Follow-up reminders and next-step recommendations"
      ],
      tips: [
        "Review AI insights before client meetings",
        "Use suggestions to improve response quality",
        "Leverage insights for personalized communication"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Insight Review",
          description: "Review AI-generated insights before client interactions",
          clientAction: "Click on conversation to view AI insights panel",
          systemResponse: "Display client preferences, budget, and timeline analysis",
          expectedOutcome: "Better understanding of client needs for personalized communication",
          timeEstimate: "2-3 minutes per client"
        },
        {
          step: 2,
          title: "Response Optimization",
          description: "Use AI feedback to improve communication quality",
          clientAction: "Review AI suggestions before sending responses",
          systemResponse: "Provide real-time feedback on response quality",
          expectedOutcome: "Higher quality, more engaging client communications",
          timeEstimate: "1-2 minutes per response"
        }
      ],
      interactiveElements: [
        {
          name: "AI Insights Panel",
          location: "Right side of conversation view",
          purpose: "Display AI-generated client insights",
          howToUse: "Click on any conversation to view insights",
          bestPractices: ["Review before client calls", "Use insights for personalization", "Update insights as conversations progress"]
        },
        {
          name: "Response Suggestions",
          location: "Email compose window",
          purpose: "AI-powered response recommendations",
          howToUse: "Look for suggestion bubbles while composing",
          bestPractices: ["Consider AI suggestions", "Customize for personal touch", "Use for complex responses"]
        }
      ]
    }
  ]
};
