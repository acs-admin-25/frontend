import { ResourceSection } from '../../../types/resources';

export const gettingStartedSection: ResourceSection = {
  id: "getting-started",
  title: "Getting Started",
  description: "Essential information to get you up and running with ACS",
  colorScheme: "from-blue-500 to-cyan-500",
  icon: "Home",
  content: [
    {
      title: "Quick Setup",
      description: "Get started with ACS in just a few steps",
      details: [
        "Log in to your ACS account",
        "Connect your email in the Settings page",
        "Explore the dashboard navigation on the left sidebar",
        "Review your lead conversion pipeline"
      ],
      stepByStepGuide: [
        {
          step: 1,
          action: "Account Access",
          description: "Navigate to the ACS login page and enter your credentials",
          visualCue: "Look for the green ACS logo and login form",
          expectedResult: "You'll be redirected to the main dashboard",
          tips: ["Bookmark the login page for quick access", "Enable 'Remember me' for convenience"]
        },
        {
          step: 2,
          action: "Email Integration",
          description: "Go to Settings → Email Configuration to connect your email",
          visualCue: "Settings icon in the bottom left sidebar",
          expectedResult: "Your emails will start appearing in the Email tab",
          tips: ["Use your primary business email", "Check spam folder if emails don't appear"]
        },
        {
          step: 3,
          action: "Dashboard Exploration",
          description: "Familiarize yourself with the main dashboard sections",
          visualCue: "Navigation menu on the left side",
          expectedResult: "You can navigate between all major features",
          tips: ["Start with the main dashboard overview", "Check the Conversations tab first"]
        }
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Initial Login",
          description: "First-time access to ACS platform",
          clientAction: "Enter email and password",
          systemResponse: "Dashboard loads with welcome message and setup prompts",
          expectedOutcome: "Access to main dashboard with guided tour",
          timeEstimate: "2-3 minutes"
        },
        {
          step: 2,
          title: "Email Setup",
          description: "Connecting business email account",
          clientAction: "Click 'Connect Email' in Settings",
          systemResponse: "OAuth authentication and email sync begins",
          expectedOutcome: "Emails appear in Email tab within 5-10 minutes",
          timeEstimate: "5-10 minutes"
        }
      ]
    },
    {
      title: "Navigation Guide",
      description: "Understanding the dashboard layout and navigation",
      details: [
        "Dashboard: Overview of your performance and metrics",
        "Conversations: Manage all client communications",
        "Leads: Track and manage potential clients",
        "Contacts: Store client information",
        "Calendar: Schedule appointments and viewings",
        "Email: Manage your email communications",
        "Analytics: Detailed performance insights",
        "Usage: Monitor your AI usage and billing",
        "Settings: Configure your account and preferences"
      ],
      interactiveElements: [
        {
          name: "Sidebar Navigation",
          location: "Left side of screen",
          purpose: "Primary navigation between major features",
          howToUse: "Click any menu item to navigate to that section",
          bestPractices: ["Use keyboard shortcuts (Ctrl+1, Ctrl+2, etc.)", "Collapse sidebar for more screen space"]
        },
        {
          name: "Search Bar",
          location: "Top of dashboard",
          purpose: "Quick search across all data",
          howToUse: "Type keywords to find conversations, leads, or contacts",
          bestPractices: ["Use specific terms for better results", "Search by client name or property address"]
        }
      ],
      featureHighlights: [
        {
          feature: "Real-time Updates",
          benefit: "Instant notification of new leads and messages",
          clientImpact: "Never miss important client communications",
          usageFrequency: "Daily",
          customizationOptions: ["Email notifications", "Push notifications", "Dashboard alerts"]
        }
      ]
    }
  ]
};
