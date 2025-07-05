import { ResourceSection } from '../../../types/resources';

export const coreFeaturesSection: ResourceSection = {
  id: "core-features",
  title: "Core Features",
  description: "Explore the main features and capabilities of ACS",
  colorScheme: "from-[#0a5a2f] to-[#157a42]",
  icon: "Zap",
  content: [
    {
      title: "Dashboard & Analytics",
      description: "Comprehensive overview of your real estate business",
      details: [
        "Main Dashboard: View lead conversion pipeline, performance metrics, and activity tracking",
        "Analytics: Analyze key metrics, conversion rates, lead sources, and trends over time",
        "Lead Funnel: Track leads through 5 stages (Contacted, Engaged, Toured, Offer Stage, Closed)",
        "Lead Reports: Generate and interpret reports on lead performance and growth"
      ],
      tips: [
        "Use date range selectors for custom analytics views",
        "Focus on conversion rates between funnel stages",
        "Monitor lead source effectiveness"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Daily Dashboard Review",
          description: "Start each day with a comprehensive dashboard overview",
          clientAction: "Open dashboard and review key metrics",
          systemResponse: "Display real-time data on leads, conversions, and performance",
          expectedOutcome: "Clear understanding of current business status",
          timeEstimate: "5-10 minutes"
        },
        {
          step: 2,
          title: "Lead Pipeline Analysis",
          description: "Review leads moving through conversion stages",
          clientAction: "Click on different funnel stages to see specific leads",
          systemResponse: "Show detailed list of leads in each stage",
          expectedOutcome: "Identify leads needing attention or follow-up",
          timeEstimate: "10-15 minutes"
        }
      ],
      interactiveElements: [
        {
          name: "Lead Funnel Visualization",
          location: "Main dashboard center",
          purpose: "Visual representation of lead conversion stages",
          howToUse: "Click on any funnel stage to see detailed lead list",
          bestPractices: ["Focus on stages with bottlenecks", "Use color coding to identify priority leads"]
        },
        {
          name: "Date Range Selector",
          location: "Top right of dashboard",
          purpose: "Filter data by specific time periods",
          howToUse: "Select predefined ranges or set custom dates",
          bestPractices: ["Compare current period to previous", "Use 30-day views for trend analysis"]
        }
      ],
      commonScenarios: [
        {
          scenario: "New Lead Arrives",
          clientContext: "Potential client submits inquiry through website",
          recommendedAction: "Review lead details and assign appropriate status",
          stepByStepProcess: [
            "Check lead source and initial message",
            "Review any attached property preferences",
            "Assign to appropriate funnel stage",
            "Send welcome message within 2 hours"
          ],
          expectedOutcome: "Lead properly categorized and initial response sent",
          followUpActions: ["Schedule follow-up call", "Add to nurturing sequence", "Update lead status"]
        }
      ]
    },
    {
      title: "Conversation Management",
      description: "AI-powered conversation tracking and lead scoring",
      details: [
        "Unified Inbox: Manage all client conversations in one place",
        "AI-Powered Lead Scoring: EV (Engagement Value) scores from 0-100",
        "Status Categories: Hot (80+), Warm (60-79), Cold (<60)",
        "Advanced Filtering: Search, filter by status, and use AI score ranges",
        "Message History: View full conversation threads and AI-generated insights"
      ],
      tips: [
        "Prioritize conversations with higher EV scores",
        "Use filters to focus on specific lead types",
        "Review AI insights for better understanding of client needs"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Conversation Review",
          description: "Daily review of all active conversations",
          clientAction: "Open Conversations tab and review unread messages",
          systemResponse: "Display conversations sorted by priority and engagement score",
          expectedOutcome: "Clear view of conversations requiring attention",
          timeEstimate: "15-20 minutes"
        },
        {
          step: 2,
          title: "Lead Scoring Analysis",
          description: "Review AI-generated engagement scores",
          clientAction: "Click on high-scoring leads to review details",
          systemResponse: "Show detailed conversation history and AI insights",
          expectedOutcome: "Understanding of why leads have specific scores",
          timeEstimate: "5-10 minutes per lead"
        }
      ],
      interactiveElements: [
        {
          name: "EV Score Filter",
          location: "Conversations page top",
          purpose: "Filter conversations by engagement value",
          howToUse: "Select score ranges (Hot: 80+, Warm: 60-79, Cold: <60)",
          bestPractices: ["Start with Hot leads each day", "Review Warm leads weekly", "Re-engage Cold leads monthly"]
        },
        {
          name: "Conversation Thread",
          location: "Right panel when conversation selected",
          purpose: "View full message history and AI insights",
          howToUse: "Click on any conversation to expand the thread view",
          bestPractices: ["Review AI insights before responding", "Use message templates for consistency"]
        }
      ],
      troubleshootingSteps: [
        {
          issue: "Low EV Scores",
          symptoms: ["Leads showing scores below 60", "Poor response rates", "Limited engagement"],
          immediateActions: [
            "Review conversation quality and response times",
            "Check if leads are receiving messages",
            "Analyze message content for engagement triggers"
          ],
          preventiveMeasures: [
            "Respond within 2 hours during business hours",
            "Personalize messages with specific details",
            "Ask engaging questions to encourage responses"
          ],
          whenToContactSupport: "If scores remain low despite following best practices"
        }
      ]
    },
    {
      title: "Lead Management",
      description: "Comprehensive lead tracking and management system",
      details: [
        "Leads Dashboard: Track and manage all potential clients",
        "AI Lead Scoring: Focus on the most promising leads",
        "Status Tracking: Monitor hot, warm, and cold leads",
        "Quick Actions: Email, call, or schedule with leads directly"
      ],
      tips: [
        "Regularly review and update lead statuses",
        "Use quick actions for faster response times",
        "Focus on high-scoring leads for better conversion"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Lead Prioritization",
          description: "Daily prioritization of leads by engagement score",
          clientAction: "Sort leads by EV score and review top prospects",
          systemResponse: "Display leads in priority order with key metrics",
          expectedOutcome: "Clear action plan for the day's lead activities",
          timeEstimate: "10-15 minutes"
        },
        {
          step: 2,
          title: "Lead Nurturing",
          description: "Systematic follow-up with leads in different stages",
          clientAction: "Use quick actions to send emails or schedule calls",
          systemResponse: "Track all interactions and update lead status",
          expectedOutcome: "Consistent engagement with all active leads",
          timeEstimate: "30-45 minutes"
        }
      ],
      interactiveElements: [
        {
          name: "Quick Actions Menu",
          location: "Each lead card",
          purpose: "Rapid access to common lead actions",
          howToUse: "Click the three-dot menu on any lead card",
          bestPractices: ["Use for immediate responses", "Schedule follow-ups in advance"]
        },
        {
          name: "Lead Status Updates",
          location: "Lead detail view",
          purpose: "Update lead progression through funnel",
          howToUse: "Click status dropdown and select new stage",
          bestPractices: ["Update status after each meaningful interaction", "Use consistent status definitions"]
        }
      ]
    },
    {
      title: "Email Management",
      description: "Streamlined email communication and organization",
      details: [
        "Email Inbox: Manage all inbound and outbound emails",
        "Email Templates: Use pre-built templates for common responses",
        "Email Categorization: Automatic sorting (lead, client, hot-lead, junk)",
        "Spam Management: Review and recover emails from Junk folder"
      ],
      tips: [
        "Customize email templates for your specific needs",
        "Regularly check the junk folder for important emails",
        "Use categorization to prioritize responses"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Email Review",
          description: "Morning email review and categorization",
          clientAction: "Open Email tab and review new messages",
          systemResponse: "Display emails sorted by category and priority",
          expectedOutcome: "Clear understanding of which emails need immediate attention",
          timeEstimate: "10-15 minutes"
        },
        {
          step: 2,
          title: "Template Response",
          description: "Use templates for consistent, professional responses",
          clientAction: "Select appropriate template and customize content",
          systemResponse: "Track email responses and update lead status",
          expectedOutcome: "Professional, consistent communication with all leads",
          timeEstimate: "5-10 minutes per email"
        }
      ],
      interactiveElements: [
        {
          name: "Email Categories",
          location: "Email tab sidebar",
          purpose: "Organize emails by type and priority",
          howToUse: "Click category tabs to filter emails",
          bestPractices: ["Start with Hot Lead category", "Check Junk folder daily", "Use categories for workflow organization"]
        },
        {
          name: "Template Library",
          location: "Email compose window",
          purpose: "Access pre-written response templates",
          howToUse: "Click template button when composing new email",
          bestPractices: ["Customize templates for personal touch", "Create templates for common scenarios", "Update templates regularly"]
        }
      ]
    },
    {
      title: "Contact Management",
      description: "Organized client information and relationship tracking",
      details: [
        "Contacts: Store and manage client information (buyers, sellers, investors)",
        "Status & Type: Track active/inactive status and contact type",
        "Search & Filter: Quickly find contacts using search and filters"
      ],
      tips: [
        "Keep contact information updated regularly",
        "Use tags and categories for better organization",
        "Maintain detailed notes for each contact"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Contact Creation",
          description: "Add new contacts from leads or manual entry",
          clientAction: "Click 'Add Contact' and fill in required information",
          systemResponse: "Create contact record and link to existing conversations",
          expectedOutcome: "Complete contact profile with all relevant information",
          timeEstimate: "2-3 minutes per contact"
        },
        {
          step: 2,
          title: "Contact Maintenance",
          description: "Regular updates to contact information and status",
          clientAction: "Review and update contact details monthly",
          systemResponse: "Maintain accurate contact database",
          expectedOutcome: "Up-to-date contact information for all clients",
          timeEstimate: "5-10 minutes per contact"
        }
      ],
      interactiveElements: [
        {
          name: "Contact Search",
          location: "Contacts page top",
          purpose: "Quickly find specific contacts",
          howToUse: "Type name, email, or phone number to search",
          bestPractices: ["Use partial names for broader searches", "Search by property address for past clients"]
        },
        {
          name: "Contact Filters",
          location: "Contacts page sidebar",
          purpose: "Filter contacts by type, status, or other criteria",
          howToUse: "Select filter options to narrow contact list",
          bestPractices: ["Use filters for targeted outreach campaigns", "Filter by activity status for follow-ups"]
        }
      ]
    }
  ]
};
