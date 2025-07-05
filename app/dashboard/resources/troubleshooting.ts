import { ResourceSection } from '../../../types/resources';

export const troubleshootingSection: ResourceSection = {
  id: "troubleshooting",
  title: "Troubleshooting & Support",
  description: "Solutions for common issues and getting help",
  colorScheme: "from-gray-500 to-slate-500",
  icon: "HelpCircle",
  content: [
    {
      title: "Common Issues",
      description: "Solutions for frequently encountered problems",
      details: [
        "Email Integration: Ensure email is connected in Settings",
        "Lead Scoring: Review conversation history for scoring accuracy",
        "Dashboard Problems: Try refreshing or logging out/in",
        "Performance Issues: Check internet connection and browser"
      ],
      tips: [
        "Clear browser cache if experiencing issues",
        "Check email connection status regularly",
        "Contact support for persistent problems"
      ],
      troubleshootingSteps: [
        {
          issue: "Email Not Syncing",
          symptoms: ["New emails not appearing", "Sync errors in settings", "Missing conversations"],
          immediateActions: [
            "Check email connection in Settings",
            "Refresh the page",
            "Clear browser cache"
          ],
          preventiveMeasures: [
            "Regularly check connection status",
            "Use supported email providers",
            "Keep browser updated"
          ],
          whenToContactSupport: "If email still doesn't sync after basic troubleshooting"
        }
      ]
    },
    {
      title: "Getting Help",
      description: "How to get support when you need it",
      details: [
        "Support Contact: Email support@automatedconsultancy.com for assistance",
        "Documentation: Check this resources page for answers",
        "Community: Connect with other ACS users (if available)",
        "Feature Requests: Submit new feature ideas through support"
      ],
      tips: [
        "Include specific details when contacting support",
        "Check documentation before reaching out",
        "Provide screenshots for technical issues"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Issue Documentation",
          description: "Document the issue before contacting support",
          clientAction: "Take screenshots and note specific error messages",
          systemResponse: "Provide detailed information for support team",
          expectedOutcome: "Faster resolution with complete information",
          timeEstimate: "5-10 minutes"
        }
      ]
    }
  ]
};
