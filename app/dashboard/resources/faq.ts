import { ResourceSection } from "../../../types/resources";

export const faqSection: ResourceSection = {
  id: "faq",
  title: "Frequently Asked Questions",
  description: "Quick answers to common questions",
  colorScheme: "from-teal-500 to-cyan-500",
  icon: "MessageSquare",
  content: [
    {
      title: "Data Security",
      description: "Understanding how your data is protected",
      details: [
        "Q: How is my data secured?",
        "A: All data is encrypted and access is strictly controlled. See the Security section for details.",
        "",
        "Q: Can I export my data?",
        "A: Contact support for data export requests and options."
      ],
      commonScenarios: [
        {
          scenario: "Data Export Request",
          clientContext: "Need to export client data for backup or migration",
          recommendedAction: "Contact support with specific export requirements",
          stepByStepProcess: [
            "Email support@automatedconsultancy.com with export request",
            "Specify data types needed",
            "Provide account verification",
            "Wait for export file delivery"
          ],
          expectedOutcome: "Secure data export in requested format",
          followUpActions: ["Verify export completeness", "Secure storage of exported data"]
        }
      ]
    },
    {
      title: "Lead Scoring",
      description: "Understanding the AI lead scoring system",
      details: [
        "Q: How does lead scoring work?",
        "A: AI analyzes conversation content and engagement to assign a score from 0-100.",
        "",
        "Q: Why did a lead's score change?",
        "A: Scores update based on new interactions and engagement patterns."
      ],
      commonScenarios: [
        {
          scenario: "Score Drop",
          clientContext: "Lead score decreased unexpectedly",
          recommendedAction: "Review recent interactions and engagement",
          stepByStepProcess: [
            "Check conversation history",
            "Review response times",
            "Analyze message quality",
            "Identify engagement issues"
          ],
          expectedOutcome: "Understanding of score change and improvement plan",
          followUpActions: ["Improve response quality", "Increase engagement", "Monitor score trends"]
        }
      ]
    },
    {
      title: "Account Management",
      description: "Managing your ACS account and settings",
      details: [
        "Q: Can I recover deleted leads or emails?",
        "A: Deleted items are permanently removed for privacy and security.",
        "",
        "Q: How do I request a new feature?",
        "A: Contact support or use the feature request form in the dashboard."
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Feature Request",
          description: "Submit new feature ideas for consideration",
          clientAction: "Use feature request form or contact support",
          systemResponse: "Log request for development team review",
          expectedOutcome: "Feature request submitted for consideration",
          timeEstimate: "5-10 minutes"
        }
      ]
    }
  ]
};
