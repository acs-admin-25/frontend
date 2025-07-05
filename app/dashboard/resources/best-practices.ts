import { ResourceSection } from '../../../types/resources';

export const bestPracticesSection: ResourceSection = {
  id: "best-practices",
  title: "Best Practices",
  description: "Proven strategies for success with ACS",
  colorScheme: "from-yellow-500 to-orange-500",
  icon: "Award",
  content: [
    {
      title: "Communication Excellence",
      description: "Optimize your client communication strategy",
      details: [
        "Quick Response: Timely responses improve conversion rates",
        "Personalization: Use client names and specific details",
        "Professional Tone: Maintain consistent, professional communication",
        "Follow-up Strategy: Systematic follow-up for better engagement"
      ],
      tips: [
        "Aim to respond within 2 hours during business hours",
        "Personalize messages with specific property details",
        "Use templates but customize for each client"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Response Management",
          description: "Daily management of client communications",
          clientAction: "Review and respond to all new messages within 2 hours",
          systemResponse: "Track response times and update conversation status",
          expectedOutcome: "Improved client satisfaction and conversion rates",
          timeEstimate: "30-45 minutes daily"
        }
      ],
      commonScenarios: [
        {
          scenario: "New Lead Inquiry",
          clientContext: "Potential client asks about property availability",
          recommendedAction: "Respond within 2 hours with personalized information",
          stepByStepProcess: [
            "Acknowledge the inquiry immediately",
            "Provide specific property details",
            "Ask qualifying questions",
            "Schedule follow-up call or viewing"
          ],
          expectedOutcome: "Engaged lead ready for next steps",
          followUpActions: ["Send property details", "Schedule viewing", "Add to nurturing sequence"]
        }
      ]
    },
    {
      title: "Dashboard Optimization",
      description: "Maximize your dashboard efficiency",
      details: [
        "Filter Usage: Leverage filters to focus on high-priority items",
        "Regular Reviews: Daily dashboard checks for new leads",
        "Status Updates: Keep lead and contact statuses current",
        "Analytics Review: Weekly performance analysis"
      ],
      tips: [
        "Set up daily dashboard review routines",
        "Use filters to create focused work sessions",
        "Schedule weekly analytics reviews"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Daily Dashboard Review",
          description: "Start each day with comprehensive dashboard overview",
          clientAction: "Open dashboard and review all key metrics and new items",
          systemResponse: "Display updated metrics and highlight new activities",
          expectedOutcome: "Clear action plan for the day's activities",
          timeEstimate: "10-15 minutes"
        }
      ]
    },
    {
      title: "Lead Management",
      description: "Effective lead nurturing and conversion",
      details: [
        "Lead Prioritization: Focus on high-scoring leads first",
        "Nurturing Process: Systematic follow-up and engagement",
        "Conversion Tracking: Monitor progress through funnel stages",
        "Relationship Building: Long-term client relationship development"
      ],
      tips: [
        "Create nurturing sequences for different lead types",
        "Track conversion rates at each funnel stage",
        "Focus on relationship building over quick sales"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Lead Prioritization",
          description: "Daily prioritization of leads by engagement and potential",
          clientAction: "Sort leads by EV score and review top prospects",
          systemResponse: "Display leads in priority order with key metrics",
          expectedOutcome: "Focused effort on highest-potential leads",
          timeEstimate: "10-15 minutes"
        }
      ]
    }
  ]
};
